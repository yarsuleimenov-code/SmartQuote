# Vehicle Fit / Capacity Output Contract

## Purpose

Define the UI data expected from the future Formula Sprint without implementing or inferring TO-BE formulas in the frontend.

## Output

```text
vehicleFit.status
vehicleFit.selectedVehicleId
vehicleFit.selectedVehicleName
vehicleFit.recommendedVehicleId
vehicleFit.recommendedVehicleName
vehicleFit.volumeFit
vehicleFit.payloadFit
vehicleFit.dimensionalFit
vehicleFit.doorOpeningFit
vehicleFit.equipmentFit

capacity.shipmentDensityLbPerCuFt
capacity.vehicleDensityThresholdLbPerCuFt
capacity.volumeUtilization
capacity.payloadUtilization
capacity.limitingFactor
capacity.selectedCostBasis
```

## Allowed Values

- `status`: `ready`, `review`, `blocked`, `notAvailable`.
- fit fields: `true`, `false`, or `null`.
- `limitingFactor`: `volume`, `weight`, or `notAvailable`.
- utilization values: decimal ratios, for example `0.7` for `70%`.

## Current UI Rule

Until Formula Sprint provides these outputs:

- show the currently selected vehicle from AS-IS calculation;
- show detailed capacity/fit values as `Not available`;
- do not derive density or limiting factor in the UI;
- do not allow the broker to select `Weight` or `Volume` manually.

## Future Presentation

Quote Draft should show only:

- fit status;
- volume utilization;
- payload utilization;
- limiting factor;
- recommended vehicle.

Cost Breakdown should show the complete capacity explanation and Formula Trace.

