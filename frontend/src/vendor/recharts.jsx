import React from "react";

export function ResponsiveContainer({ children }) {
  return (
    <div className="w-full h-full flex items-center justify-center overflow-hidden">
      {children}
    </div>
  );
}

export function CartesianGrid() {
  return null;
}
export function XAxis() {
  return null;
}
export function YAxis() {
  return null;
}
export function Tooltip() {
  return null;
}
export function Legend() {
  return null;
}
export function Area() {
  return null;
}
export function Line() {
  return null;
}
export function Bar() {
  return null;
}
export function Pie() {
  return null;
}
export function Cell() {
  return null;
}

function getChildElements(children, compName) {
  return React.Children.toArray(children).filter(
    (c) => React.isValidElement(c) && (c.type?.name === compName || c.props?.dataKey)
  );
}

export function BarChart({ data = [], children, layout = "horizontal" }) {
  if (!data.length) {
    return <p className="text-xs text-[#66708F]">No chart data available</p>;
  }
  const allChildren = React.Children.toArray(children).filter(React.isValidElement);
  const bars = allChildren.filter((c) => c.props?.dataKey && c.props?.fill);
  const xAxis = allChildren.find(
    (c) => c.props?.dataKey && !c.props?.fill && c.props?.type !== "number"
  );
  const labelKey =
    xAxis?.props?.dataKey ||
    Object.keys(data[0]).find((k) => typeof data[0][k] === "string") ||
    "name";

  const activeBars = bars.length
    ? bars
    : [{ props: { dataKey: Object.keys(data[0])[1] || "value", fill: "#6555F5", name: "Value" } }];

  const maxVal = Math.max(
    1,
    ...data.flatMap((row) =>
      activeBars.map((b) => Number(row[b.props.dataKey] || 0))
    )
  );

  if (layout === "vertical") {
    return (
      <div className="w-full h-full flex flex-col justify-center gap-2 px-2 overflow-y-auto">
        {data.slice(0, 6).map((row, idx) => {
          const val = Number(row[activeBars[0].props.dataKey] || 0);
          const pct = Math.round((val / maxVal) * 100);
          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="font-semibold text-[#182044]">{row[labelKey]}</span>
                <span className="font-bold text-[#6555F5]">{val}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${pct}%`,
                    backgroundColor: activeBars[0].props.fill || "#6555F5",
                  }}
                  className="h-full rounded-full"
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-end pt-4 pb-1 px-2">
      <div className="flex-1 flex items-end justify-around gap-3 border-b border-slate-200 pb-2">
        {data.map((row, idx) => (
          <div
            key={idx}
            className="flex-1 flex flex-col items-center justify-end h-full group"
          >
            <div className="flex items-end justify-center gap-1 w-full h-36">
              {activeBars.map((b, bIdx) => {
                const val = Number(row[b.props.dataKey] || 0);
                const heightPct = Math.max(8, Math.round((val / maxVal) * 100));
                return (
                  <div
                    key={bIdx}
                    className="flex flex-col items-center justify-end h-full flex-1 max-w-[26px]"
                  >
                    <span className="text-[10px] font-bold text-[#182044] mb-1">
                      {val}
                    </span>
                    <div
                      style={{
                        height: `${heightPct}%`,
                        backgroundColor: b.props.fill || "#6555F5",
                      }}
                      className="w-full rounded-t-md pt-transition"
                    />
                  </div>
                );
              })}
            </div>
            <span className="text-[10px] font-medium text-[#66708F] mt-2 truncate max-w-[72px]">
              {row[labelKey]}
            </span>
          </div>
        ))}
      </div>
      {activeBars.length > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          {activeBars.map((b, i) => (
            <div key={i} className="flex items-center gap-1.5 text-[11px] text-[#66708F]">
              <span
                style={{ backgroundColor: b.props.fill }}
                className="w-2.5 h-2.5 rounded-xs"
              />
              <span>{b.props.name || b.props.dataKey}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function AreaChart({ data = [], children }) {
  return <LineOrAreaChart data={data} children={children} isArea />;
}

export function LineChart({ data = [], children }) {
  return <LineOrAreaChart data={data} children={children} isArea={false} />;
}

function LineOrAreaChart({ data = [], children, isArea }) {
  if (!data.length) {
    return <p className="text-xs text-[#66708F]">No chart data available</p>;
  }
  const allChildren = React.Children.toArray(children).filter(React.isValidElement);
  const series = allChildren.find((c) => c.props?.stroke || c.props?.fill);
  const dataKey = series?.props?.dataKey || Object.keys(data[0])[1] || "value";
  const labelKey = Object.keys(data[0])[0] || "month";
  const strokeColor = series?.props?.stroke || "#6555F5";

  const values = data.map((d) => Number(d[dataKey] || 0));
  const maxVal = Math.max(5, ...values);
  const width = 460;
  const height = 165;
  const padX = 32;
  const padY = 24;

  const points = data.map((d, i) => {
    const x =
      padX +
      (data.length > 1
        ? (i / (data.length - 1)) * (width - padX * 2)
        : (width - padX * 2) / 2);
    const y =
      height -
      padY -
      (Number(d[dataKey] || 0) / maxVal) * (height - padY * 2);
    return { x, y, label: d[labelKey], val: Number(d[dataKey] || 0) };
  });

  const polylinePoints = points.map((p) => `${p.x},${p.y}`).join(" ");
  const areaPoints = `${points[0].x},${height - padY} ${polylinePoints} ${
    points[points.length - 1].x
  },${height - padY}`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
      <line
        x1={padX}
        y1={height - padY}
        x2={width - padX}
        y2={height - padY}
        stroke="#E2E8F0"
        strokeWidth="1"
      />
      {isArea && (
        <polygon points={areaPoints} fill="#EEEAFE" opacity="0.85" />
      )}
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="3"
        points={polylinePoints}
      />
      {points.map((p, idx) => (
        <g key={idx}>
          <circle cx={p.x} cy={p.y} r="4.5" fill={strokeColor} />
          <text
            x={p.x}
            y={p.y - 8}
            textAnchor="middle"
            fontSize="10"
            fontWeight="700"
            fill="#182044"
          >
            {p.val}
          </text>
          <text
            x={p.x}
            y={height - 6}
            textAnchor="middle"
            fontSize="10"
            fill="#66708F"
          >
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

export function PieChart({ children }) {
  const allChildren = React.Children.toArray(children).filter(React.isValidElement);
  const pieEl = allChildren.find((c) => Array.isArray(c.props?.data));
  const data = pieEl?.props?.data || [];
  const total = Math.max(
    1,
    data.reduce((acc, item) => acc + Number(item.value || 0), 0)
  );

  return (
    <div className="w-full h-full flex flex-col sm:flex-row items-center justify-center gap-8 px-4">
      <div className="relative w-36 h-36 rounded-full border-8 border-[#6555F5] flex flex-col items-center justify-center bg-[#F4F5FF]">
        <span className="text-xl font-extrabold text-[#182044]">{total}</span>
        <span className="text-[10px] font-semibold text-[#66708F]">Students</span>
      </div>
      <div className="space-y-2.5">
        {data.map((item, idx) => {
          const pct = Math.round((Number(item.value || 0) / total) * 100);
          return (
            <div key={idx} className="flex items-center gap-3 text-xs">
              <span
                style={{ backgroundColor: item.color || "#6555F5" }}
                className="w-3.5 h-3.5 rounded-md shrink-0"
              />
              <span className="font-semibold text-[#182044] w-36">
                {item.name}
              </span>
              <span className="font-bold text-[#6555F5]">
                {item.value} ({pct}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
