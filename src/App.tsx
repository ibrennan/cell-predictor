import { Card, Input, Stack, Table, Text } from "@mantine/core";
import { useMemo, useState } from "react";
import { data } from "./data";
import Highcharts from "highcharts";
import { HighchartsReact } from "highcharts-react-official";
import { useDebouncedState } from "@mantine/hooks";

function getExpectedCellCount(opticalDensity: number) {
  // If the opticalDensity is less than the minimum or more than the maximum in the data set,
  // we cannot extrapolate. Return null in these cases.
  if (
    opticalDensity < data[0][0] ||
    opticalDensity > data[data.length - 1][0]
  ) {
    return null;
  }

  // Find the two nearest points in the data set.
  let lowerPoint = data[0];
  let upperPoint = data[1];
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] > opticalDensity) {
      upperPoint = data[i];
      break;
    }
    lowerPoint = data[i];
  }

  // Perform linear interpolation.
  const proportion =
    (opticalDensity - lowerPoint[0]) / (upperPoint[0] - lowerPoint[0]);
  const cellCount =
    lowerPoint[1] + proportion * (upperPoint[1] - lowerPoint[1]);

  return cellCount;
}

function App() {
  const [input, setInput] = useDebouncedState("", 200);

  const nearestDataPointIndex = useMemo(() => {
    const goal = Number(input);
    const match = data.reduce(function (prev, curr) {
      return Math.abs(curr[0] - goal) < Math.abs(prev[0] - goal) ? curr : prev;
    });
    return data.findIndex((datum) => datum[0] === match[0]);
  }, [input]);

  const predictedValue = useMemo(() => {
    return getExpectedCellCount(Number(input));
  }, [input]);

  const chartOptions: Highcharts.Options = {
    title: { text: "" },
    xAxis: {
      categories: data.map((d) => `${d[0]}`),
      title: { text: "Optical Density" },
      plotLines:
        nearestDataPointIndex && predictedValue
          ? [
              {
                color: "red",
                dashStyle: "Solid",
                value: nearestDataPointIndex,
                width: 2,
                label: {
                  text: predictedValue.toLocaleString(),
                },
              },
            ]
          : undefined,
    },
    yAxis: {
      title: {
        text: "Cell Count",
      },
    },
    series: [{ name: "", data: data.map((d) => d[1]), type: "line" }],
    legend: {
      enabled: false,
    },
  };

  return (
    <Stack py="xl" align="center">
      <Card maw="1100px" w="100%">
        <Input
          size="xl"
          placeholder="Optical Density"
          defaultValue={input}
          onChange={(e) => setInput(e.currentTarget.value)}
        />
        <Text size="xl" align="center">
          =
        </Text>
        <Input
          size="xl"
          value={predictedValue?.toLocaleString() || ""}
          disabled
        />
      </Card>
      <Card maw="1100px" w="100%">
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      </Card>
      <Card maw="1100px" w="100%">
        <Table>
          <thead>
            <tr>
              <th>Optical Density</th>
              <th>Cell Count</th>
            </tr>
          </thead>
          <tbody>
            {data.map((datum) => {
              return (
                <tr>
                  <td>{datum[0].toFixed(3)}</td>
                  <td>{datum[1].toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </Card>
    </Stack>
  );
}

export default App;
