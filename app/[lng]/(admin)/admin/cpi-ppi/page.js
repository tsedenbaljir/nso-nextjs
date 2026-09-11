"use client";

import React, { useCallback, useEffect, useState } from "react";
import { Button, InputNumber, Select, message } from "antd";
import {
  CalendarOutlined,
  EditOutlined,
  PlusOutlined,
  ReloadOutlined,
  SaveOutlined,
} from "@ant-design/icons";

const ADMIN_API = "/api/cpi-ppi/admin";

const MONTH_LABEL = (m) => {
  if (!m) return "";
  const [y, mo] = m.split("-");
  return `${y} оны ${Number(mo)}-р сар`;
};

function toNum(v) {
  if (v == null || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function CpiPpiAdminPage() {
  const [mode, setMode] = useState("edit"); // edit | add
  const [metaLoading, setMetaLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [months, setMonths] = useState([]);
  const [month, setMonth] = useState(null);
  const [newMonth, setNewMonth] = useState("");
  const [rows, setRows] = useState([]);
  const [dirty, setDirty] = useState(false);
  const [suggestedNext, setSuggestedNext] = useState(null);
  const [isNewDraft, setIsNewDraft] = useState(false);

  const loadMeta = useCallback(async () => {
    setMetaLoading(true);
    try {
      const res = await fetch(ADMIN_API, { cache: "no-store" });
      const json = await res.json();
      if (!json.status) throw new Error(json.message);
      const list = json.data.months || [];
      setMonths(list);
      setSuggestedNext(json.data.suggestedNext);
      setNewMonth((cur) => cur || json.data.suggestedNext || "");
      setMonth((cur) => cur || (list.length ? list[list.length - 1] : null));
    } catch (err) {
      message.error(err.message || "Мета алдаа");
    } finally {
      setMetaLoading(false);
    }
  }, []);

  const loadSheet = useCallback(async (m) => {
    if (!m) return;
    setLoading(true);
    try {
      const res = await fetch(`${ADMIN_API}?month=${encodeURIComponent(m)}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!json.status) throw new Error(json.message);
      setRows(
        (json.data.products || []).map((p) => ({
          ...p,
          cpi: p.cpi,
          ppi: p.ppi,
        })),
      );
      setMonths(json.data.months || []);
      setSuggestedNext(json.data.suggestedNext);
      setDirty(false);
      setIsNewDraft(false);
    } catch (err) {
      message.error(err.message || "Сар татахад алдаа");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMeta();
  }, [loadMeta]);

  useEffect(() => {
    if (mode === "edit" && month && !isNewDraft) loadSheet(month);
  }, [mode, month, isNewDraft, loadSheet]);

  const setCell = (id, field, value) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
    setDirty(true);
  };

  const switchMode = (next) => {
    if (dirty && !window.confirm("Хадгалаагүй. Солих уу?")) return;
    setMode(next);
    setDirty(false);
    setIsNewDraft(false);
    if (next === "edit" && month) loadSheet(month);
    if (next === "add") {
      setRows([]);
      setNewMonth(suggestedNext || "");
    }
  };

  const onSave = async () => {
    if (!month) {
      message.info("Сар сонгоно уу");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(ADMIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert-month",
          month,
          items: rows.map((r) => ({
            product_id: r.id,
            cpi: toNum(r.cpi),
            ppi: toNum(r.ppi),
          })),
        }),
      });
      const json = await res.json();
      if (!json.status) throw new Error(json.message);
      message.success(json.message || "Хадгаллаа");
      setDirty(false);
      setIsNewDraft(false);
      setMode("edit");
      await loadMeta();
      await loadSheet(month);
    } catch (err) {
      message.error(err.message || "Хадгалах алдаа");
    } finally {
      setSaving(false);
    }
  };

  const startNewMonth = async () => {
    const target = (newMonth || suggestedNext || "").trim();
    if (!/^\d{4}-\d{2}$/.test(target)) {
      message.error("YYYY-MM (жишээ: 2026-08)");
      return;
    }
    if (months.includes(target)) {
      message.info("Сар байна — Засах руу шилжлээ");
      setMode("edit");
      setMonth(target);
      setIsNewDraft(false);
      return;
    }

    const prev = months.length ? months[months.length - 1] : null;
    setMonth(target);
    setIsNewDraft(true);
    setLoading(true);
    try {
      if (prev) {
        const res = await fetch(`${ADMIN_API}?month=${encodeURIComponent(prev)}`, {
          cache: "no-store",
        });
        const json = await res.json();
        if (json.status) {
          setRows(
            (json.data.products || []).map((p) => ({
              ...p,
              cpi: p.cpi,
              ppi: p.ppi,
            })),
          );
          setDirty(true);
          message.success(`${MONTH_LABEL(target)} · өмнөх сараас`);
          return;
        }
      }
      const meta = await fetch(ADMIN_API, { cache: "no-store" }).then((r) => r.json());
      setRows(
        (meta.data?.products || []).map((p) => ({
          ...p,
          cpi: null,
          ppi: null,
        })),
      );
      setDirty(true);
    } catch (err) {
      message.error(err.message || "Шинэ сар алдаа");
    } finally {
      setLoading(false);
    }
  };

  const emptyHint =
    mode === "add" ? "Сар бичээд Нэмэх" : months.length ? "Сар сонгоно уу" : "Дата байхгүй";

  return (
    <div className="cpi-admin">
      <style jsx global>{`
        .cpi-admin {
          --cpi: #1a5cad;
          --ppi: #c45c26;
          --ink: #1c2a3a;
          --muted: #5a6b7d;
          --line: #e4eaf1;
          --card: #fff;
          max-width: 1200px;
          margin: 0 auto;
          padding: 8px 4px 48px;
          color: var(--ink);
        }
        .cpi-admin h1 {
          font-size: 1.65rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          margin: 0 0 4px;
        }
        .cpi-admin .lede {
          color: var(--muted);
          margin: 0 0 20px;
          font-size: 0.95rem;
        }
        .cpi-mode {
          display: inline-flex;
          gap: 4px;
          padding: 4px;
          background: #eef2f7;
          border-radius: 12px;
          margin-bottom: 14px;
        }
        .cpi-mode button {
          border: none;
          background: transparent;
          padding: 8px 18px;
          border-radius: 9px;
          font-weight: 650;
          font-size: 14px;
          color: var(--muted);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .cpi-mode button.is-on {
          background: #fff;
          color: var(--ink);
          box-shadow: 0 1px 3px rgba(28, 42, 58, 0.12);
        }
        .cpi-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          align-items: flex-end;
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 16px 18px;
          margin-bottom: 18px;
          box-shadow: 0 1px 2px rgba(28, 42, 58, 0.04);
        }
        .cpi-field label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: var(--muted);
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .cpi-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-left: auto;
        }
        .cpi-status {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .cpi-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 600;
          background: #eef3f9;
          color: var(--ink);
        }
        .cpi-pill--cpi {
          background: rgba(26, 92, 173, 0.1);
          color: var(--cpi);
        }
        .cpi-pill--ppi {
          background: rgba(196, 92, 38, 0.1);
          color: var(--ppi);
        }
        .cpi-pill--warn {
          background: #fff4e5;
          color: #9a5b00;
        }
        .cpi-pill--add {
          background: rgba(15, 122, 77, 0.1);
          color: #0f7a4d;
        }
        .cpi-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }
        @media (max-width: 960px) {
          .cpi-grid {
            grid-template-columns: 1fr;
          }
        }
        .cpi-panel {
          background: var(--card);
          border: 1px solid var(--line);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(28, 42, 58, 0.04);
        }
        .cpi-panel__head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 16px;
          border-bottom: 1px solid var(--line);
        }
        .cpi-panel__head h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }
        .cpi-panel--cpi .cpi-panel__head {
          background: linear-gradient(180deg, #f3f7fc 0%, #fff 100%);
          border-top: 3px solid var(--cpi);
        }
        .cpi-panel--ppi .cpi-panel__head {
          background: linear-gradient(180deg, #fdf6f1 0%, #fff 100%);
          border-top: 3px solid var(--ppi);
        }
        .cpi-panel__count {
          font-size: 12px;
          color: var(--muted);
          font-weight: 600;
        }
        .cpi-table {
          width: 100%;
          border-collapse: collapse;
        }
        .cpi-table th {
          text-align: left;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--muted);
          padding: 10px 14px;
          border-bottom: 1px solid var(--line);
          background: #fafbfd;
        }
        .cpi-table td {
          padding: 8px 14px;
          border-bottom: 1px solid var(--line);
          vertical-align: middle;
        }
        .cpi-table tr:last-child td {
          border-bottom: none;
        }
        .cpi-table tr:hover td {
          background: #f8fafc;
        }
        .cpi-name {
          font-weight: 600;
          font-size: 13.5px;
          line-height: 1.3;
        }
        .cpi-unit {
          display: block;
          font-size: 11px;
          color: var(--muted);
          font-weight: 500;
          margin-top: 2px;
        }
        .cpi-input.ant-input-number {
          width: 120px;
          border-radius: 8px;
        }
        .cpi-footer {
          position: sticky;
          bottom: 12px;
          margin-top: 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(8px);
          border: 1px solid var(--line);
          border-radius: 14px;
          box-shadow: 0 8px 24px rgba(28, 42, 58, 0.1);
        }
        .cpi-new {
          display: flex;
          gap: 8px;
          align-items: center;
          flex-wrap: wrap;
        }
        .cpi-new input {
          width: 130px;
          height: 32px;
          border: 1px solid var(--line);
          border-radius: 8px;
          padding: 0 10px;
          font-size: 14px;
        }
      `}</style>

      <h1>ХҮИ / ҮҮИ</h1>

      <div className="cpi-mode" role="tablist">
        <button
          type="button"
          className={mode === "edit" ? "is-on" : ""}
          onClick={() => switchMode("edit")}
        >
          <EditOutlined /> Засах
        </button>
        <button
          type="button"
          className={mode === "add" ? "is-on" : ""}
          onClick={() => switchMode("add")}
        >
          <PlusOutlined /> Нэмэх
        </button>
      </div>

      <div className="cpi-toolbar">
        {mode === "edit" ? (
          <>
            <div className="cpi-field">
              <label>Сар</label>
              <Select
                style={{ minWidth: 220 }}
                loading={metaLoading}
                value={month}
                placeholder="Сонгох"
                options={[...months].reverse().map((m) => ({
                  value: m,
                  label: MONTH_LABEL(m),
                }))}
                onChange={(m) => {
                  setIsNewDraft(false);
                  setMonth(m);
                }}
                suffixIcon={<CalendarOutlined />}
                showSearch
                optionFilterProp="label"
              />
            </div>
            <div className="cpi-actions">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => loadSheet(month)}
                loading={loading}
                disabled={!month}
              >
                Шинэчлэх
              </Button>
            </div>
          </>
        ) : (
          <div className="cpi-field">
            <label>Сар</label>
            <div className="cpi-new">
              <input
                value={newMonth}
                onChange={(e) => setNewMonth(e.target.value)}
                placeholder={suggestedNext || "YYYY-MM"}
                onKeyDown={(e) => {
                  if (e.key === "Enter") startNewMonth();
                }}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={startNewMonth} loading={loading}>
                Нэмэх
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="cpi-grid">
        <section className="cpi-panel cpi-panel--cpi">
          <div className="cpi-panel__head">
            <h2>CPI</h2>
            <span className="cpi-panel__count">{rows.length}</span>
          </div>
          <table className="cpi-table">
            <thead>
              <tr>
                <th>Бараа</th>
                <th style={{ width: 140 }}>Үнэ (₮)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`cpi-${r.id}`}>
                  <td>
                    <span className="cpi-name">{r.short || r.name}</span>
                    <span className="cpi-unit">{r.unit || "—"}</span>
                  </td>
                  <td>
                    <InputNumber
                      className="cpi-input"
                      value={r.cpi}
                      min={0}
                      step={0.1}
                      controls={false}
                      onChange={(v) => setCell(r.id, "cpi", v)}
                      disabled={loading}
                    />
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={2} style={{ padding: 24, color: "#5a6b7d" }}>
                    {emptyHint}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>

        <section className="cpi-panel cpi-panel--ppi">
          <div className="cpi-panel__head">
            <h2>PPI</h2>
            <span className="cpi-panel__count">{rows.length}</span>
          </div>
          <table className="cpi-table">
            <thead>
              <tr>
                <th>Бараа</th>
                <th style={{ width: 140 }}>Үнэ (₮)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`ppi-${r.id}`}>
                  <td>
                    <span className="cpi-name">{r.short || r.name}</span>
                    <span className="cpi-unit">{r.unit || "—"}</span>
                  </td>
                  <td>
                    <InputNumber
                      className="cpi-input"
                      value={r.ppi}
                      min={0}
                      step={0.1}
                      controls={false}
                      onChange={(v) => setCell(r.id, "ppi", v)}
                      disabled={loading}
                    />
                  </td>
                </tr>
              ))}
              {!rows.length ? (
                <tr>
                  <td colSpan={2} style={{ padding: 24, color: "#5a6b7d" }}>
                    {emptyHint}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </section>
      </div>

      <div className="cpi-footer">
        <span />
        <Button
          type="primary"
          size="large"
          icon={<SaveOutlined />}
          loading={saving}
          disabled={!dirty || !month || !rows.length}
          onClick={onSave}
        >
          Хадгалах
        </Button>
      </div>
    </div>
  );
}
