"use client";

import { useMemo, useState, useCallback } from "react";
import { Card, Checkbox, Segmented, Select, Space, TreeSelect } from "antd";
import { buildBusTreeData } from "@/lib/socio-dashboard/bus-tree";
import type { PxVariable } from "@/lib/socio-dashboard/types";

function BusTreeSelect({
  treeData,
  expandToLeafCodes,
  value,
  onChange,
  allValues,
  loading,
}: {
  treeData: ReturnType<typeof buildBusTreeData>["treeData"];
  expandToLeafCodes: ReturnType<typeof buildBusTreeData>["expandToLeafCodes"];
  value: string[];
  onChange: (values: string[]) => void;
  allValues: string[];
  loading?: boolean;
}) {
  const handleChange = useCallback((keys: string[]) => {
    const next = (keys ?? []) as string[];
    const expanded = next.length ? expandToLeafCodes(next) : allValues;
    onChange(expanded);
  }, [expandToLeafCodes, allValues, onChange]);

  return (
    <TreeSelect
      size="small"
      treeData={treeData}
      value={value.length ? value : undefined}
      onChange={handleChange}
      multiple
      treeCheckable
      showCheckedStrategy={TreeSelect.SHOW_CHILD}
      placeholder="Бүс/аймаг сонгох"
      style={{ width: "min(100%, 260px)", minWidth: 0, maxWidth: "100%" }}
      dropdownStyle={{ maxHeight: 360 }}
      popupMatchSelectWidth={false}
      allowClear
      treeDefaultExpandAll={false}
      maxTagCount="responsive"
      disabled={loading}
    />
  );
}

interface DashboardFiltersProps {
  variables: PxVariable[];
  selections: Record<string, string[]>;
  onSelectionChange: (code: string, values: string[]) => void;
  loading?: boolean;
  hiddenVariables?: string[];
  /** Override display label per variable code (e.g. { "Хүм амын тоо": "" } to hide label) */
  labelOverrides?: Record<string, string>;
  busSingleSelect?: boolean;
  slicerOnly?: boolean;
  /** Use wider select width (e.g. for Эдийн засгийн салбар with long labels) */
  slicerWider?: boolean;
  /** Exclude options whose label contains this string (e.g. "Бүгд") */
  excludeOptionLabelContaining?: string;
  /** Variable codes that should render as checkbox slicer (multi-select pills) instead of dropdown filter */
  checkboxSlicerVariables?: string[];
}

export function DashboardFilters({
  variables,
  selections,
  onSelectionChange,
  loading,
  hiddenVariables,
  labelOverrides,
  busSingleSelect = false,
  slicerOnly = false,
  slicerWider = false,
  excludeOptionLabelContaining,
  checkboxSlicerVariables,
}: DashboardFiltersProps) {
  const visible = hiddenVariables?.length
    ? variables.filter(
        (v) =>
          !hiddenVariables.some(
            (h) => h === v.code || v.text?.toLowerCase() === h.toLowerCase()
          )
      )
    : variables;

  const busVariable = visible.find((v) => v.code === "Бүс");
  const busTreeData = useMemo(() => {
    if (!busVariable) return null;
    return buildBusTreeData(busVariable.values, busVariable.valueTexts ?? []);
  }, [busVariable?.values.join(","), busVariable?.valueTexts?.join(",")]);

  if (visible.length === 0) return null;

  const content = (
    <Space size="middle" wrap>
        {visible.map((v) => {
          const selected = selections[v.code] ?? v.values;
          const isMulti = v.values.length > 3;
          const useCheckboxes = v.code === "Бүлэг" || (checkboxSlicerVariables != null && checkboxSlicerVariables.includes(v.code));
          const useTree = v.code === "Бүс";
          const busTree = useTree ? busTreeData : null;
          return (
            <Space key={v.code} align="start" size={8}>
              {(labelOverrides?.[v.code] ?? v.text) ? (
                <span className="chart-section-label text-[var(--muted-foreground)] uppercase tracking-wide">
                  {labelOverrides?.[v.code] ?? v.text}
                </span>
              ) : null}
              {useTree && busTree ? (
                busSingleSelect ? (
                  <TreeSelect
                    size="small"
                    treeData={busTree.treeData}
                    value={selected[0] ?? undefined}
                    onChange={(key) => {
                      if (key == null) {
                        const firstAimag = busTree.expandToLeafCodes([busTree.treeData[0]?.value].filter(Boolean))[0];
                        onSelectionChange(v.code, firstAimag ? [firstAimag] : v.values);
                        return;
                      }
                      const expanded = busTree.expandToLeafCodes([key as string]);
                      onSelectionChange(v.code, expanded.length ? [expanded[0]] : v.values);
                    }}
                    treeCheckable={false}
                    placeholder="Аймаг сонгох"
                    style={{ width: "min(100%, 260px)", minWidth: 0, maxWidth: "100%" }}
                    dropdownStyle={{ maxHeight: 360 }}
                    allowClear={false}
                    treeDefaultExpandAll={false}
                    disabled={loading}
                  />
                ) : (
                  <BusTreeSelect
                    treeData={busTree.treeData}
                    expandToLeafCodes={busTree.expandToLeafCodes}
                    value={selected}
                    onChange={(vals) => onSelectionChange(v.code, vals)}
                    allValues={v.values}
                    loading={loading}
                  />
                )
              ) : useCheckboxes ? (
                <Select
                  size="small"
                  className={slicerOnly ? "select-inline" : ""}
                  value="__bulag_display__"
                  options={[
                    {
                      value: "__bulag_display__",
                      label:
                        selected.length === 0 || selected.length === v.values.length
                          ? (v.code === "Он" ? "Бүх он" : "Бүгд")
                          : (v.code === "Он" ? `${selected.length} жил` : `${selected.length} сонгосон`),
                    },
                  ]}
                  dropdownRender={() => (
                    <div onClick={(e) => e.stopPropagation()} style={{ minWidth: 280 }}>
                      <div style={{ maxHeight: 280, overflowY: "auto", padding: 12 }}>
                        <Checkbox.Group
                          value={selected}
                          onChange={(vals) =>
                            onSelectionChange(v.code, (vals as string[]).length ? (vals as string[]) : v.values)
                          }
                          options={v.values.map((val, i) => ({
                            value: val,
                            label: v.valueTexts?.[i] ?? val,
                          }))}
                          style={{ display: "flex", flexDirection: "column", gap: 6 }}
                        />
                      </div>
                    </div>
                  )}
                  dropdownStyle={{ minWidth: 280 }}
                  disabled={loading}
                  style={
                    slicerOnly
                      ? slicerWider
                        ? { width: "min(100%, 280px)", minWidth: 0, maxWidth: "100%" }
                        : { width: "min(100%, 180px)", minWidth: 0, maxWidth: "100%" }
                      : { width: "min(100%, 260px)", minWidth: 0, maxWidth: "100%" }
                  }
                />
              ) : isMulti ? (
                <Select
                  size="small"
                  className={slicerOnly ? "select-inline" : ""}
                  value={
                    v.code === "Он" && selected.length === v.values.length ? "__all__" : (selected[0] ?? "")
                  }
                  onChange={(val) => {
                    if (v.code === "Он" && val === "__all__") {
                      onSelectionChange(v.code, v.values);
                    } else {
                      onSelectionChange(v.code, [val]);
                    }
                  }}
                  disabled={loading}
                  style={
                    slicerOnly
                      ? slicerWider
                        ? { width: "min(100%, 280px)", minWidth: 0, maxWidth: "100%" }
                        : { width: "min(100%, 180px)", minWidth: 0, maxWidth: "100%" }
                      : { width: "min(100%, 260px)", minWidth: 0, maxWidth: "100%" }
                  }
                  virtual={false}
                  options={
                    v.code === "Он"
                      ? [
                          { value: "__all__", label: "Бүх он" },
                          ...v.values.map((val, i) => ({ value: val, label: v.valueTexts?.[i] ?? val })),
                        ]
                      : v.values
                          .map((val, i) => ({ value: val, label: v.valueTexts?.[i] ?? val }))
                          .filter(
                            (o) =>
                              !excludeOptionLabelContaining || !String(o.label).includes(excludeOptionLabelContaining)
                          )
                  }
                />
              ) : (
                <Segmented
                  size="small"
                  className={slicerOnly ? "segmented-inline" : "segmented-pill"}
                  value={selected[0] ?? v.values[0]}
                  onChange={(val) => onSelectionChange(v.code, [String(val)])}
                  disabled={loading}
                  options={v.values.map((val, i) => ({
                    label: v.valueTexts?.[i] ?? val,
                    value: val,
                  }))}
                />
              )}
            </Space>
          );
        })}
      </Space>
  );

  if (slicerOnly) return content;
  return <Card size="small" bodyStyle={{ padding: 14 }}>{content}</Card>;
}
