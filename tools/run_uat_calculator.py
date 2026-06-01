import argparse
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

try:
    import openpyxl
except ImportError as exc:
    raise SystemExit("openpyxl is required to read Zaberman_Calculator_UAT.xlsx") from exc


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_WORKBOOK = ROOT / "Zaberman_Calculator_UAT.xlsx"

ZONE_ZIPS = {
    "CA South": "90001",
    "CA North": "90049",
    "NY Area": "10001",
    "DC Area": "19701",
    "Boston": "01420",
    "TX": "75001",
}

ITEM_TEMPLATES = {
    "chair": {"name": "Chair", "volume": 17, "weight": 40, "fragile": False, "nonStackable": False, "crated": False},
    "sofa": {"name": "Sofa", "volume": 35, "weight": 150, "fragile": False, "nonStackable": False, "crated": False},
    "table": {"name": "Table", "volume": 21, "weight": 120, "fragile": False, "nonStackable": False, "crated": False},
    "cabinet": {"name": "Cabinet", "volume": 25, "weight": 120, "fragile": False, "nonStackable": False, "crated": False},
    "cab": {"name": "Cabinet", "volume": 25, "weight": 120, "fragile": False, "nonStackable": False, "crated": False},
    "mattress": {"name": "Mattress", "volume": 45, "weight": 80, "fragile": False, "nonStackable": True, "crated": False},
    "mat": {"name": "Mattress", "volume": 45, "weight": 80, "fragile": False, "nonStackable": True, "crated": False},
    "artwork / mirror": {"name": "Artwork / Mirror", "volume": 8, "weight": 40, "fragile": True, "nonStackable": True, "crated": False},
    "mirror": {"name": "Artwork / Mirror", "volume": 8, "weight": 40, "fragile": True, "nonStackable": True, "crated": False},
}


def find_node(explicit):
    candidates = [
        explicit,
        os.environ.get("NODE"),
        shutil.which("node"),
        str(Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe"),
    ]
    for candidate in candidates:
        if candidate and Path(candidate).exists():
            return candidate
    raise SystemExit("Node.js was not found. Pass --node <path-to-node> or set NODE.")


def load_uat_rows(workbook_path):
    workbook = openpyxl.load_workbook(workbook_path, data_only=True)
    sheet = workbook["Test Cases"]
    headers = [cell.value for cell in sheet[1]]
    rows = []
    for values in sheet.iter_rows(min_row=2, values_only=True):
        row = dict(zip(headers, values))
        if row.get("Test ID"):
            rows.append(row)
    return rows


def parse_qty(value, item_count):
    if isinstance(value, (int, float)):
        return [int(value)]
    parts = [part.strip() for part in str(value or "").replace("/", "*").split("*") if part.strip()]
    quantities = [int(float(part)) for part in parts] if parts else [1]
    if len(quantities) == 1 and item_count > 1:
        return quantities * item_count
    return quantities


def normalize_item_key(name):
    return str(name or "").strip().lower()


def split_items(value):
    return [part.strip() for part in str(value or "").split("+") if part.strip()]


def packaging_for(template):
    if template["crated"]:
        return "Custom Crate"
    if template["fragile"]:
        return "Bubble Protection"
    return "Blanket Wrap"


def full_item(template, qty, index):
    volume = int(template["volume"])
    return {
        "id": f"uat-item-{index + 1}",
        "name": template["name"],
        "length": volume * 12,
        "width": 12,
        "height": 12,
        "weight": template["weight"],
        "qty": qty,
        "packaging": packaging_for(template),
        "insurance": "Basic Liability",
        "declaredValue": 0,
        "storageDays": 0,
        "fragile": template["fragile"],
        "nonStackable": template["nonStackable"],
        "crated": template["crated"],
        "comment": "Created from UAT workbook",
    }


def apply_conditions(item, conditions):
    text = str(conditions or "").lower()
    if "fragile" in text:
        item["fragile"] = True
        item["packaging"] = "Bubble Protection"
    if "non-stack" in text or "non stack" in text:
        item["nonStackable"] = True
    if "insurance" in text and item["name"] == "Artwork / Mirror":
        item["insurance"] = "Full Coverage"
        item["declaredValue"] = 5000
    if "storage" in text and item["name"] == "Cabinet":
        item["storageDays"] = 30
    return item


def build_quote(row):
    item_names = split_items(row["Items"])
    quantities = parse_qty(row["Qt"], len(item_names))
    items = []
    for index, item_name in enumerate(item_names):
        key = normalize_item_key(item_name)
        template = ITEM_TEMPLATES.get(key)
        if not template:
            raise ValueError(f"Unsupported UAT item template: {item_name}")
        qty = quantities[index] if index < len(quantities) else 1
        items.append(apply_conditions(full_item(template, qty, index), row.get("Доп. условия")))

    return {
        "estimateId": row["Test ID"],
        "status": "uat",
        "customer": {"leadName": row["Сценарий"], "name": "UAT", "phone": "", "email": ""},
        "route": {
            "pickupZip": ZONE_ZIPS[row["Pickup"]],
            "deliveryZip": ZONE_ZIPS[row["Delivery"]],
            "pickupAddress": f"{row['Pickup']} UAT zone",
            "deliveryAddress": f"{row['Delivery']} UAT zone",
        },
        "access": {
            "pickup": {"addressType": "House", "coi": False, "stairs": False, "elevatorUnavailable": False, "narrowAccess": False, "floor": 1, "longCarryFt": 0, "crew": 2},
            "delivery": {"addressType": "House", "coi": False, "stairs": False, "elevatorUnavailable": False, "narrowAccess": False, "floor": 1, "longCarryFt": 0, "crew": 2},
        },
        "options": {
            "exclusiveDelivery": False,
            "priorityDate": False,
            "helperRequirement": "Auto",
            "deliveryType": "Consolidated Route",
            "requestedDate": "",
            "manualAdjustment": 0,
            "notes": "",
        },
        "items": items,
    }


def run_calculator(node_path, quotes):
    runner = """
const fs = require("fs");
const vm = require("vm");
const root = process.argv[2];
const inputPath = process.argv[3];
process.chdir(root);
const context = { window: {}, console };
context.window.window = context.window;
vm.createContext(context);
["js/zoneZipMap.js", "js/variables.js", "js/mockData.js", "js/calculator.js"].forEach((file) => {
  vm.runInContext(fs.readFileSync(file, "utf8"), context, { filename: file });
});
const quotes = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const results = quotes.map((entry) => {
  const result = context.window.PricingCalculator.calculateQuote(entry.quote);
  return {
    id: entry.id,
    finalPrice: result.totals.finalPrice,
    rawPrice: result.totals.rawPrice,
    operationalCost: result.totals.operationalCost,
    additionalCharges: result.totals.additionalCharges,
    effectiveVolume: result.totals.effectiveVolume,
    totalWeight: result.totals.totalWeight,
    requiredCrew: result.requiredCrew,
    warnings: result.warnings,
  };
});
process.stdout.write(JSON.stringify(results));
"""
    with tempfile.TemporaryDirectory() as tmp:
        tmp_path = Path(tmp)
        input_path = tmp_path / "uat-quotes.json"
        runner_path = tmp_path / "uat-runner.js"
        input_path.write_text(json.dumps(quotes), encoding="utf-8")
        runner_path.write_text(runner, encoding="utf-8")
        completed = subprocess.run(
            [node_path, str(runner_path), str(ROOT), str(input_path)],
            check=True,
            capture_output=True,
            text=True,
        )
    return json.loads(completed.stdout)


def print_table(rows):
    header = "ID   Expected  Actual  Diff   Status  Scenario"
    print(header)
    print("-" * len(header))
    for row in rows:
        print(
            f"{row['id']:<4} "
            f"{row['expected']:>8.0f} "
            f"{row['actual']:>7.0f} "
            f"{row['diff']:>5.0f} "
            f"{row['status']:<6} "
            f"{row['scenario']}"
        )


def main():
    parser = argparse.ArgumentParser(description="Run SmartQuote calculations against Zaberman_Calculator_UAT.xlsx.")
    parser.add_argument("--workbook", default=str(DEFAULT_WORKBOOK))
    parser.add_argument("--baseline", choices=["Spreadsheet", "Zion"], default="Spreadsheet")
    parser.add_argument("--tolerance", type=float, default=0)
    parser.add_argument("--node", default=None)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--strict", action="store_true", help="Exit with code 1 when any case fails.")
    args = parser.parse_args()

    workbook_path = Path(args.workbook)
    rows = load_uat_rows(workbook_path)
    quotes = [{"id": row["Test ID"], "quote": build_quote(row)} for row in rows]
    results_by_id = {item["id"]: item for item in run_calculator(find_node(args.node), quotes)}

    output = []
    for row in rows:
        result = results_by_id[row["Test ID"]]
        expected = float(row[args.baseline])
        actual = float(result["finalPrice"])
        diff = actual - expected
        status = "PASS" if abs(diff) <= args.tolerance else "FAIL"
        output.append({
            "id": row["Test ID"],
            "scenario": row["Сценарий"],
            "route": f"{row['Pickup']} -> {row['Delivery']}",
            "items": row["Items"],
            "expected": expected,
            "actual": actual,
            "diff": diff,
            "status": status,
            "engine": result,
        })

    if args.json:
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print_table(output)
        passed = sum(1 for row in output if row["status"] == "PASS")
        print(f"\nSummary: {passed}/{len(output)} passed against {args.baseline} baseline.")

    if args.strict and any(row["status"] != "PASS" for row in output):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
