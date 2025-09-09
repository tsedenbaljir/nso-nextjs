'use client';
import { useState } from 'react';

const VariableSelector = ({ variable, onChange, lng }) => {
  const [selected, setSelected] = useState([]);
  const [childSelected, setChildSelected] = useState([]);
  const [grandChildSelected, setGrandChildSelected] = useState([]);
  const [greatGrandChildSelected, setGreatGrandChildSelected] = useState([]);

  const recomputeAndEmit = (base, child, grand, great) => {
    const filteredChild = variable.values.filter(
      (val) =>
        (val.length === 2 || val.length === 3) &&
        base.some((b) => val.startsWith(b) && b !== '0')
    );
    const newChild = child.filter((c) => filteredChild.includes(c));

    const filteredGrand = variable.values.filter(
      (val) => val.length === 5 && newChild.some((c) => val.startsWith(c))
    );
    const newGrand = grand.filter((g) => filteredGrand.includes(g));

    const filteredGreat = variable.values.filter(
      (val) => val.length === 7 && newGrand.some((g) => val.startsWith(g))
    );
    const newGreat = great.filter((gr) => filteredGreat.includes(gr));

    setSelected(base);
    setChildSelected(newChild);
    setGrandChildSelected(newGrand);
    setGreatGrandChildSelected(newGreat);
    onChange(variable.code, [...base, ...newChild, ...newGrand, ...newGreat]);
  };

  const toggleValue = (val) => {
    const updated = selected.includes(val)
      ? selected.filter((v) => v !== val)
      : [...selected, val];
    recomputeAndEmit(
      updated,
      childSelected,
      grandChildSelected,
      greatGrandChildSelected
    );
  };

  const toggleSub = (val, list, level) => {
    const updated = list.includes(val)
      ? list.filter((v) => v !== val)
      : [...list, val];
    const setters = {
      child: [selected, updated, grandChildSelected, greatGrandChildSelected],
      grand: [selected, childSelected, updated, greatGrandChildSelected],
      great: [selected, childSelected, grandChildSelected, updated],
    };
    recomputeAndEmit(...setters[level]);
  };

  const toggleAll = (level) => {
    let values = [];
    let current = [];
    switch (level) {
      case 'base':
        values = variable.values
          .filter((val) =>
            variable.text !== 'Бүс' && variable.text !== 'Region' &&
              variable.text !== 'Аймаг' && variable.text !== 'Aimag' &&
              variable.text !== 'Аймаг, сум' && variable.text !== 'Aimag, soum' &&
              variable.text !== 'Баг, хороо' && variable.text !== 'Bag, khoroo' &&
              variable.text !== 'Аймгийн код' && variable.text !== 'Aimag code' &&
              variable.text !== 'Засаг захиргааны нэгж' && variable.text !== 'Administrator unit' && variable.text !== 'Administrative unit' ? true : val.length === 1);
        current = selected;
        recomputeAndEmit(
          current.length === values.length ? [] : values,
          childSelected,
          grandChildSelected,
          greatGrandChildSelected
        );
        break;
      case 'child':
        values = variable.values.filter(
          (val) =>
            (val.length === 2 || val.length === 3) &&
            selected.some((s) => val.startsWith(s))
        );
        current = childSelected;
        recomputeAndEmit(
          selected,
          current.length === values.length ? [] : values,
          grandChildSelected,
          greatGrandChildSelected
        );
        break;
      case 'grand':
        values = variable.values.filter(
          (val) =>
            val.length === 5 && childSelected.some((c) => val.startsWith(c))
        );
        current = grandChildSelected;
        recomputeAndEmit(
          selected,
          childSelected,
          current.length === values.length ? [] : values,
          greatGrandChildSelected
        );
        break;
      case 'great':
        values = variable.values.filter(
          (val) =>
            val.length === 7 &&
            grandChildSelected.some((g) => val.startsWith(g))
        );
        current = greatGrandChildSelected;
        recomputeAndEmit(
          selected,
          childSelected,
          grandChildSelected,
          current.length === values.length ? [] : values
        );
        break;
    }
  };

  return (
    <>
      <div className='flex flex-row flex-wrap gap-2 col-span-4 w-full md:min-w-[24%] md:max-w-[270px]'>
        <div className="border border-gray-400 rounded-md bg-white shadow flex flex-col w-full col-span-4">
          <h2 className="bg-[#005baa] text-white font-medium py-2 px-4 rounded-t flex items-center justify-between">
            <span>{variable.text}</span>
          </h2>
          <div className='m-2 max-h-64 w-full md:min-w-[24%] md:max-w-[270px] overflow-y-auto h-full'>
            {variable.values
              .filter((val) =>
                variable.text !== 'Бүс' && variable.text !== 'Region' &&
                  variable.text !== 'Аймаг' && variable.text !== 'Aimag' &&
                  variable.text !== 'Аймаг, сум' && variable.text !== 'Aimag, soum' &&
                  variable.text !== 'Баг, хороо' && variable.text !== 'Bag, khoroo' &&
                  variable.text !== 'Аймгийн код' && variable.text !== 'Aimag code' &&
                  variable.text !== 'Засаг захиргааны нэгж' && variable.text !== 'Administrator unit' && variable.text !== 'Administrative unit' ? true : val.length === 1)
              .map((val, index) => (
                val !== '' && <div
                  key={`${val}-${index}`}
                  className='flex items-center mb-1'
                  onClick={() => toggleValue(val)}
                >
                  <input
                    type='checkbox'
                    checked={selected.includes(val)}
                    onChange={() => toggleValue(val)}
                    className='mr-2'
                  />
                  <label className='cursor-pointer text-sm font-normal'>
                    {variable.valueTexts[variable.values.indexOf(val)] || val}
                  </label>
                </div>
              ))}
          </div>
          <button
            onClick={() => toggleAll('base')}
            className='mt-3 bg-gray-2 border rounded px-3 py-2 m-1 text-gray-700 font-normal'
          >
            {selected.length ===
              variable.values.filter((val) =>
                variable.text !== 'Бүс' && variable.text !== 'Region' &&
                  variable.text !== 'Аймаг' && variable.text !== 'Aimag' &&
                  variable.text !== 'Аймаг, сум' && variable.text !== 'Aimag, soum' &&
                  variable.text !== 'Баг, хороо' && variable.text !== 'Bag, khoroo' &&
                  variable.text !== 'Аймгийн код' && variable.text !== 'Aimag code' &&
                  variable.text !== 'Засаг захиргааны нэгж' && variable.text !== 'Administrator unit' && variable.text !== 'Administrative unit' ? true : val.length === 1).length
              ? '❌'
              : '✅'}
            {lng === 'mn' ? 'Бүгдийг' : 'Select'} {' '}
            {selected.length ===
              variable.values.filter((val) =>
                variable.text !== 'Бүс' && variable.text !== 'Region' &&
                  variable.text !== 'Аймаг' && variable.text !== 'Aimag' &&
                  variable.text !== 'Аймаг, сум' && variable.text !== 'Aimag, soum' &&
                  variable.text !== 'Баг, хороо' && variable.text !== 'Bag, khoroo' &&
                  variable.text !== 'Аймгийн код' && variable.text !== 'Aimag code' &&
                  variable.text !== 'Засаг захиргааны нэгж' && variable.text !== 'Administrator unit' && variable.text !== 'Administrative unit' ? true : val.length === 1).length
              ? lng === 'mn' ? 'болих' : 'Remove'
              : lng === 'mn' ? 'сонгох' : 'All'}
          </button>
        </div>
      </div>

      {(variable.code === 'Аймаг' || variable.code === 'Aimag' ||
        variable.code === 'Бүс' || variable.code === 'Region' ||
        variable.code === 'Аймаг, сум' || variable.code === 'Aimag, soum' ||
        variable.code === 'Баг, хороо' || variable.code === 'Bag, khoroo' ||
        variable.code === 'Аймгийн код' || variable.code === 'Aimag code' ||
        variable.code === 'Засаг захиргааны нэгж' || variable.code === 'Administrator unit') && (
          <>
            {selected.length > 0 && (
              <SelectorBox
                label={lng === 'mn' ? 'Аймаг/Нийслэл' : 'Provice/Capital'}
                level='child'
                list={childSelected}
                dependsOn={selected}
                lengths={[2, 3]}
                toggleSub={toggleSub}
                toggleAll={toggleAll}
                values={variable.values}
                valueTexts={variable.valueTexts}
                lng={lng}
              />
            )}
            {childSelected.length > 0 && (
              <SelectorBox
                label={lng === 'mn' ? 'Сум/Дүүрэг' : 'Soum/District'}
                level='grand'
                list={grandChildSelected}
                dependsOn={childSelected}
                lengths={[5]}
                toggleSub={toggleSub}
                toggleAll={toggleAll}
                values={variable.values}
                valueTexts={variable.valueTexts}
                lng={lng}
              />
            )}
            {grandChildSelected.length > 0 && (
              <SelectorBox
                label={lng === 'mn' ? 'Баг/Хороо' : 'Bag/Khoroo'}
                level='great'
                list={greatGrandChildSelected}
                dependsOn={grandChildSelected}
                lengths={[7]}
                toggleSub={toggleSub}
                toggleAll={toggleAll}
                values={variable.values}
                valueTexts={variable.valueTexts}
                lng={lng}
              />
            )}
          </>
        )}
    </>
  );
};

const SelectorBox = ({
  label,
  level,
  list,
  dependsOn,
  lengths,
  toggleSub,
  toggleAll,
  values,
  valueTexts,
  lng
}) => {
  const filtered = values.filter(
    (val) =>
      lengths.includes(val.length) && dependsOn.some((s) => val.startsWith(s))
  );
  const toggle = (val) => toggleSub(val, list, level);
  // console.log(level, filtered.length);
  return (
    filtered.length > 0 && (
      <div className='flex flex-row flex-wrap gap-2 col-span-4 w-full md:min-w-[24%] md:max-w-[270px]'>
        <div className="border border-gray-400 rounded-md bg-white shadow flex flex-col w-full">
          <h2 className="bg-[#005baa] text-white font-medium py-2 px-4 rounded-t flex items-center justify-between">
            <span>
              {label}
            </span>
          </h2>
          <div className='m-2 max-h-64 w-full md:min-w-[24%] md:max-w-[270px] overflow-y-auto h-full'>
            {filtered.map((val, index) => (
              <div
                key={`${val}-${values.indexOf(val)}-${index}`}
                className='flex items-center'
                onClick={() => toggle(val)}
              >
                <input
                  type='checkbox'
                  checked={list.includes(val)}
                  onChange={() => toggle(val)}
                  className='mr-2'
                />
                <label className='cursor-pointer text-sm font-normal'>
                  {valueTexts[values.indexOf(val)] || val}
                </label>
              </div>
            ))}
          </div>
          <button
            onClick={() => toggleAll(level)}
            className='mt-3 bg-gray-2 border rounded px-3 py-2 m-1 text-gray-700 font-normal'
          >
            {list.length === filtered.length ? '❌' : '✅'} {lng === 'mn' ? 'Бүгдийг' : 'Select'} {' '}
            {list.length === filtered.length ? lng === 'mn' ? 'болих' : 'Remove' : lng === 'mn' ? 'сонгох' : 'All'}
          </button>
        </div>
      </div>
    )
  );
};

export default VariableSelector;
