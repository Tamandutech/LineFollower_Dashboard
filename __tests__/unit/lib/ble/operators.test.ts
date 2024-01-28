import { dataToMessages } from "@/lib/ble/operators";
import { of } from "rxjs";
import { TestScheduler } from "rxjs/testing";

const scheduler = new TestScheduler((actual, expected) => {
  expect(actual).toEqual(expected);
});

describe("dataToMessages", () => {
  it("should return an array of messages", () => {
    scheduler.run(({ expectObservable }): void => {
      expectObservable(
        of(
          '{"cmdExecd":"param_list","data":"Dados parametrizados registrados: 9\n 0 - sLatMarks.marks: \n 1 - sLatMarks.thresholdToCurve: 4\n 2 - sLatMarks.MarkstoStop: 10\n 3 - sLatMarks.PulsesBeforeCurve: 225\n 4 - sLatMarks.',
          'PulsesAfterCurve: 6\n 5 - sLatMarks.thresholdLongLine: 1500\n 6 - sLatMarks.thresholdMediumLine: 1000\n 7 - sLatMarks.thresholdLongCurve: 900\n 8 - sLatMarks.thresholdMediumCurve: 500\n 9 - PIDVel.Kp_std: 0.000000\n"}\0',
          '{"cmdExecd":"param_set sLatMarks.thresholdToCurve 5","data":"OK"}\0',
          '{"cmdExecd":"param_get sLatMarks.thresholdToCurve","data":"5"}\0',
        ).pipe(dataToMessages()),
      ).toBe("(abc|)", {
        a: {
          cmdExecd: "param_list",
          data: "Dados parametrizados registrados: 9\n 0 - sLatMarks.marks: \n 1 - sLatMarks.thresholdToCurve: 4\n 2 - sLatMarks.MarkstoStop: 10\n 3 - sLatMarks.PulsesBeforeCurve: 225\n 4 - sLatMarks.PulsesAfterCurve: 6\n 5 - sLatMarks.thresholdLongLine: 1500\n 6 - sLatMarks.thresholdMediumLine: 1000\n 7 - sLatMarks.thresholdLongCurve: 900\n 8 - sLatMarks.thresholdMediumCurve: 500\n 9 - PIDVel.Kp_std: 0.000000\n",
        },
        b: { cmdExecd: "param_set sLatMarks.thresholdToCurve 5", data: "OK" },
        c: { cmdExecd: "param_get sLatMarks.thresholdToCurve", data: "5" },
      });
    });
  });
});
