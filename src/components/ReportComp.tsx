import {
    Component,
    createContext,
    createMemo,
    For,
    Show,
    useContext
} from "solid-js";
import { MS_IN_DAYS, MS_IN_WEEKS } from "../lib/constants";
import { renderDuration, renderPercentage } from "../lib/format";
import { getLabelImmediateChildren, leafLabel } from "../lib/labels";

export type ShowType = "total" | "weekly" | "daily" | "percent";

type ReportProps = {
  labelTimeMap: Map<Label, number>;
  totalDuration: number;
  showType?: ShowType;
  showColors?: boolean;
  getLabelInfo?: (label: Label) => any;
  oncontextmenu?: (e: MouseEvent, label: Label) => void;
};

function renderReportDuration(time: number, total: number, display: ShowType) {
  switch (display) {
    case "total":
      return renderDuration(time);
    case "daily":
      return `${renderDuration((time * MS_IN_DAYS) / total)}/d`;
    case "weekly":
      return `${renderDuration((time * MS_IN_WEEKS) / total)}/w`;
    case "percent":
      return renderPercentage(time / total);
  }
}

const Block: Component<{
  label: Label;
}> = (props) => {
  const report = useReport();
  const { getLabelInfo, oncontextmenu } = report;

  const [info, setInfo] = getLabelInfo(props.label);

  const childrenLabels = createMemo(() =>
    getLabelImmediateChildren(props.label, [...report.labelTimeMap.keys()])
  );

  const isLeaf = createMemo(() => childrenLabels().length === 0);

  return (
    <>
      <div
        class={
          "flex items-center space-x-1 h-6 " +
          (!isLeaf() ? "cursor-pointer" : "")
        }
        onclick={() => setInfo({ expanded: !info.expanded })}
        oncontextmenu={(e) => oncontextmenu(e, props.label)}
      >
        <Show when={report.showColors}>
          <div class="w-1 h-5" style={{ "background-color": info.color }} />
        </Show>
        <span>
          [
          {renderReportDuration(
            report.labelTimeMap.get(props.label),
            report.totalDuration,
            report.showType || "total"
          )}
          ]
        </span>
        <span>
          {leafLabel(props.label)} {!isLeaf() ? "[+]" : ""}
        </span>
      </div>
      <Show when={info?.expanded}>
        <div class="pl-8">
          <For each={childrenLabels()}>
            {(label) => <Block label={label} />}
          </For>
        </div>
      </Show>
    </>
  );
};

const ReportContext = createContext<ReportProps>();
const useReport = () => useContext(ReportContext);

const Report: Component<ReportProps> = (props) => {
  const topLabels = createMemo(() =>
    getLabelImmediateChildren(null, [...props.labelTimeMap.keys()])
  );

  return (
    <div class="select-none overflow-auto">
      [{renderDuration(props.totalDuration)}] total
      <ReportContext.Provider value={props}>
        <div class="pl-8">
          <For each={topLabels()}>{(label) => <Block label={label} />}</For>
        </div>
      </ReportContext.Provider>
    </div>
  );
};

export default Report;
