'use client';
import { useState } from 'react';

const VariableSelector = ({ variable, onChange, lng }) => {
  const [selected, setSelected] = useState([]);
  const [level1Selected, setLevel1Selected] = useState([]);
  const [level2Selected, setLevel2Selected] = useState([]);
  const [level3Selected, setLevel3Selected] = useState([]);
  const [level4Selected, setLevel4Selected] = useState([]);
  const [level5Selected, setLevel5Selected] = useState([]);
  const [level6Selected, setLevel6Selected] = useState([]);
  const [level7Selected, setLevel7Selected] = useState([]);

  const getLevelValues = (level, dependsOn = []) => {
    // Check if this is a time-related variable
    const timeKeywords = ['он', 'жил', 'улирал', 'хугацаа', 'сар'];
    const isTimeVariable = timeKeywords.some((kw) => variable.text.toLowerCase().includes(kw));
    
    // For time variables, only show level 1 with all data
    if (isTimeVariable) {
      if (level === 0) {
        return variable.values;
      }
      return [];
    }
    
    switch (level) {
      case 0:
        return variable.values.filter((val) => 
          variable.code !== 'Баг, хороо' && 
          variable.code !== 'Аймгийн код' && 
          variable.code !== 'Аймаг, нийслэл' &&
          variable.code !== 'Аймаг' && 
          variable.code !== 'Засаг захиргааны нэгж' ? true : val.length === 1
        );
      case 1:
        return variable.values.filter((val) => val.length === 2 && dependsOn.some((d) => val.startsWith(d) && d !== '0'));
      case 2:
        return variable.values.filter((val) => val.length === 3 && dependsOn.some((d) => val.startsWith(d)));
      case 3:
        return variable.values.filter((val) => val.length === 4 && dependsOn.some((d) => val.startsWith(d)));
      case 4:
        return variable.values.filter((val) => val.length === 5 && dependsOn.some((d) => val.startsWith(d)));
      case 5:
        return variable.values.filter((val) => val.length === 6 && dependsOn.some((d) => val.startsWith(d)));
      case 6:
        return variable.values.filter((val) => val.length === 7 && dependsOn.some((d) => val.startsWith(d)));
      case 7:
        return variable.values.filter((val) => val.length === 8 && dependsOn.some((d) => val.startsWith(d)));
      default:
        return [];
    }
  };

  const recomputeAndEmit = (level0, level1, level2, level3, level4, level5, level6, level7) => {
    const allSelected = [...level0, ...level1, ...level2, ...level3, ...level4, ...level5, ...level6, ...level7];
    
    setSelected(level0);
    setLevel1Selected(level1);
    setLevel2Selected(level2);
    setLevel3Selected(level3);
    setLevel4Selected(level4);
    setLevel5Selected(level5);
    setLevel6Selected(level6);
    setLevel7Selected(level7);
    
    onChange(variable.code, allSelected);
  };

  const toggleValue = (val, level) => {
    const levelStates = [selected, level1Selected, level2Selected, level3Selected, level4Selected, level5Selected, level6Selected, level7Selected];
    const levelSetters = [setSelected, setLevel1Selected, setLevel2Selected, setLevel3Selected, setLevel4Selected, setLevel5Selected, setLevel6Selected, setLevel7Selected];
    
    const currentLevel = levelStates[level];
    const updated = currentLevel.includes(val)
      ? currentLevel.filter((v) => v !== val)
      : [...currentLevel, val];
    
    // Recompute dependent levels
    const newStates = [...levelStates];
    newStates[level] = updated;
    
    // Update dependent levels
    for (let i = level + 1; i < 8; i++) {
      const dependsOn = i === 1 ? updated : newStates[i - 1];
      const availableValues = getLevelValues(i, dependsOn);
      newStates[i] = levelStates[i].filter(val => availableValues.includes(val));
    }
    
    recomputeAndEmit(...newStates);
  };

  const toggleAll = (level) => {
    const levelStates = [selected, level1Selected, level2Selected, level3Selected, level4Selected, level5Selected, level6Selected, level7Selected];
    const dependsOn = getLevelDependsOn(level);
    const values = getLevelValues(level, dependsOn);
    const current = levelStates[level];
    
    const newStates = [...levelStates];
    newStates[level] = current.length === values.length ? [] : values;
    
    // Update dependent levels
    for (let i = level + 1; i < 8; i++) {
      const nextDependsOn = getLevelDependsOn(i);
      const availableValues = getLevelValues(i, nextDependsOn);
      newStates[i] = levelStates[i].filter(val => availableValues.includes(val));
    }
    
    recomputeAndEmit(...newStates);
  };

  const getLevelLabel = (level) => {
    const labels = {
      mn: ['Үндсэн түвшин', 'Дэд түвшин', 'Гуравдагч түвшин', 'Дөрөвдөгч түвшин', 'Тавдагч түвшин', 'Зургадагч түвшин', 'Долдогч түвшин', 'Наймдагч түвшин'],
      en: ['Base Level', 'Sub Level', 'Third Level', 'Fourth Level', 'Fifth Level', 'Sixth Level', 'Seventh Level', 'Eighth Level']
    };
    return labels[lng][level];
  };

  const shouldShowLevel = (level) => {
    if (level === 0) return true;
    
    // For level 1, check if base level has selections
    if (level === 1) return selected.length > 0;
    
    // For other levels, check if there are available values for this level
    const dependsOn = getLevelDependsOn(level);
    const values = getLevelValues(level, dependsOn);
    
    return values.length > 0;
  };

  const getLevelSelected = (level) => {
    switch (level) {
      case 0: return selected;
      case 1: return level1Selected;
      case 2: return level2Selected;
      case 3: return level3Selected;
      case 4: return level4Selected;
      case 5: return level5Selected;
      case 6: return level6Selected;
      case 7: return level7Selected;
      default: return [];
    }
  };

  const getLevelDependsOn = (level) => {
    if (level === 0) return [];
    
    const previousLevels = [
      selected,
      level1Selected,
      level2Selected,
      level3Selected,
      level4Selected,
      level5Selected,
      level6Selected
    ];
    
    // Find the closest previous level that has data
    for (let i = level - 1; i >= 0; i--) {
      if (previousLevels[i].length > 0) {
        return previousLevels[i];
      }
    }
    
    return [];
  };

  return (
    <>
      {[0, 1, 2, 3, 4, 5, 6, 7].map((level) => {
        if (!shouldShowLevel(level)) return null;
        
        const levelSelected = getLevelSelected(level);
        const dependsOn = getLevelDependsOn(level);
        const values = getLevelValues(level, dependsOn);
        
        if (values.length === 0) return null;
        
        return (
          <div key={level} className='flex flex-row flex-wrap gap-2 col-span-4 min-w-[24%] max-w-[270px]'>
            <div className="border border-gray-400 rounded-md bg-white shadow flex flex-col w-full col-span-4">
              <h2 className="bg-[#005baa] text-white font-bold py-2 px-4 rounded-t flex items-center justify-between">
                <span>{level === 0 ? variable.text : getLevelLabel(level)}</span>
              </h2>
              <div className='m-2 max-h-64 min-w-[24%] max-w-[270px] overflow-y-auto h-full'>
                {values.map((val, index) => (
                  val !== '' && (
                    <div
                      key={`${val}-${index}`}
                      className='flex items-center mb-1'
                      onClick={() => toggleValue(val, level)}
                    >
                      <input
                        type='checkbox'
                        checked={levelSelected.includes(val)}
                        onChange={() => toggleValue(val, level)}
                        className='mr-2'
                      />
                      <label className='cursor-pointer text-sm font-normal'>
                        {variable.valueTexts[variable.values.indexOf(val)] || val}
                      </label>
                    </div>
                  )
                ))}
              </div>
              <button
                onClick={() => toggleAll(level)}
                className='mt-3 bg-gray-2 border rounded px-3 py-2 m-1 text-gray-700 font-normal'
              >
                {levelSelected.length === values.length ? '❌' : '✅'}
                {lng === 'mn' ? 'Бүгдийг' : 'Select'} {' '}
                {levelSelected.length === values.length 
                  ? lng === 'mn' ? 'болих' : 'Remove'
                  : lng === 'mn' ? 'сонгох' : 'All'}
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
};

export default VariableSelector;
