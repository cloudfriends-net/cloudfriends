'use client'

import { useState, ChangeEvent, Fragment } from 'react'
import { TrashIcon, ClipboardDocumentIcon, ClipboardDocumentCheckIcon, ExclamationTriangleIcon, Bars3BottomLeftIcon, RectangleGroupIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

// --- KACE Function Definitions ---

// Defines the type of input for a KACE function parameter.
type KaceParamType = 'text' | 'select' | 'number';

// Defines the structure of a single parameter for a KACE function.
type KaceParam = {
  name: string; // Internal name for the parameter
  label: string; // Display label for the UI
  type: KaceParamType; // Type of the input field
  placeholder?: string; // Placeholder text for input fields
  options?: string[]; // Options for 'select' type parameters
  defaultValue?: string | number; // Default value for the parameter
  required?: boolean; // Whether the parameter is required for validation
};

// Defines the structure for a KACE function, including its display name, parameters, template for string generation, and parsing regex.
type KaceFunctionDefinition = {
  displayName: string; // User-friendly name for the function
  params: KaceParam[]; // Array of parameters the function accepts
  template: (params: Record<string, string>) => string; // Function to generate the KACE rule string part
  parseRegex?: RegExp; // Regular expression to parse this function from a string
};

// A map to store all KACE function definitions, keyed by their internal name.
type KaceFunctionMap = Record<string, KaceFunctionDefinition>;

// Constants for KACE registry hives and file operators, used in parameter options.
const KACE_REG_HIVES = ['HKEY_LOCAL_MACHINE', 'HKEY_CURRENT_USER', 'HKEY_CLASSES_ROOT', 'HKEY_USERS', 'HKEY_CURRENT_CONFIG'];
const KACE_FILE_OPERATORS = ['=', '!=', '>', '>=', '<', '<='];

// Object containing all defined KACE functions and their properties.
const KACE_FUNCTIONS: KaceFunctionMap = {
  FileExists: {
    displayName: 'File Exists',
    params: [{ name: 'path', label: 'File Path', type: 'text', placeholder: 'C:\\Path\\To\\File.exe', defaultValue: '', required: true }],
    template: (p) => `FileExists(${p.path})`,
    parseRegex: /^FileExists\s*\((.+)\)$/i,
  },
  FileVersion: {
    displayName: 'File Version',
    params: [
      { name: 'path', label: 'File Path', type: 'text', placeholder: 'C:\\Path\\To\\File.exe', defaultValue: '', required: true },
      { name: 'operator', label: 'Operator', type: 'select', options: KACE_FILE_OPERATORS, defaultValue: '>=' },
      { name: 'version', label: 'Version', type: 'text', placeholder: '1.0.0.0', defaultValue: '', required: true },
    ],
    template: (p) => `FileVersion(${p.path}, ${p.operator}, ${p.version})`,
    parseRegex: /^FileVersion\s*\((.+)\)$/i,
  },
  DirectoryExists: {
    displayName: 'Directory Exists',
    params: [{ name: 'path', label: 'Directory Path', type: 'text', placeholder: 'C:\\Path\\To\\Directory', defaultValue: '', required: true }],
    template: (p) => `DirectoryExists(${p.path})`,
    parseRegex: /^DirectoryExists\s*\((.+)\)$/i,
  },
  RegistryKeyExists: {
    displayName: 'Registry Key Exists',
    params: [
      { name: 'hive', label: 'Hive', type: 'select', options: KACE_REG_HIVES, defaultValue: 'HKEY_LOCAL_MACHINE' },
      { name: 'path', label: 'Key Path', type: 'text', placeholder: 'SOFTWARE\\Microsoft\\Windows', defaultValue: '', required: true },
    ],
    template: (p) => `RegistryKeyExists(${p.hive}\\${p.path})`,
    parseRegex: /^RegistryKeyExists\s*\((.+)\)$/i,
  },
  RegistryValueEquals: {
    displayName: 'Registry Value Equals',
    params: [
      { name: 'hive', label: 'Hive', type: 'select', options: KACE_REG_HIVES, defaultValue: 'HKEY_LOCAL_MACHINE' },
      { name: 'path', label: 'Key Path', type: 'text', placeholder: 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', defaultValue: '', required: true },
      { name: 'valueName', label: 'Value Name', type: 'text', placeholder: 'ProductName', defaultValue: '', required: true },
      { name: 'valueData', label: 'Value Data', type: 'text', placeholder: 'Windows 10 Pro', defaultValue: '', required: true },
    ],
    template: (p) => `RegistryValueEquals(${p.hive}\\${p.path}, ${p.valueName}, ${p.valueData})`,
    parseRegex: /^RegistryValueEquals\s*\((.+)\)$/i,
  },
  RegistryValueContains: {
    displayName: 'Registry Value Contains',
    params: [
      { name: 'hive', label: 'Hive', type: 'select', options: KACE_REG_HIVES, defaultValue: 'HKEY_LOCAL_MACHINE' },
      { name: 'path', label: 'Key Path', type: 'text', placeholder: 'SOFTWARE\\Microsoft\\Windows NT\\CurrentVersion', defaultValue: '', required: true },
      { name: 'valueName', label: 'Value Name', type: 'text', placeholder: 'CSDVersion', defaultValue: '', required: true },
      { name: 'valueData', label: 'Value Data (contains)', type: 'text', placeholder: 'Service Pack', defaultValue: '', required: true },
    ],
    template: (p) => `RegistryValueContains(${p.hive}\\${p.path}, ${p.valueName}, ${p.valueData})`,
    parseRegex: /^RegistryValueContains\s*\((.+)\)$/i,
  },
};

// --- Types for Rule Structure (Conditions and Groups) ---

// Represents a single condition in the rule (e.g., FileExists(...)).
export type KaceCondition = {
  id: string; // Unique identifier for the condition
  type: 'condition'; // Type discriminator
  selectedFunctionKey: string; // Key of the KACE function used (e.g., 'FileExists')
  paramValues: Record<string, string>; // Values for the parameters of the selected function
};

// Represents a group of conditions or other groups, joined by an operator.
export type KaceGroup = {
  id: string; // Unique identifier for the group
  type: 'group'; // Type discriminator
  childrenJoinOperator: 'AND' | 'OR'; // Operator used to join the children of this group
  children: KaceRuleElement[]; // Array of conditions or sub-groups within this group
};

// Union type representing either a condition or a group, forming the elements of a rule.
export type KaceRuleElement = KaceCondition | KaceGroup;

/**
 * Generates initial parameter values for a given KACE function.
 * @param functionKey The key of the KACE function.
 * @returns A record of parameter names to their default values.
 */
const getInitialParamValues = (functionKey: string): Record<string, string> => {
  const funcDef = KACE_FUNCTIONS[functionKey];
  if (!funcDef) return {};
  return funcDef.params.reduce((acc, param) => {
    acc[param.name] = param.defaultValue?.toString() || '';
    return acc;
  }, {} as Record<string, string>);
};

// --- Main React Component: QuestKaceInventoryRuleBuilder ---
export default function QuestKaceInventoryRuleBuilder() {
  // State for the rule structure: array of top-level conditions or groups.
  const [ruleElements, setRuleElements] = useState<KaceRuleElement[]>([]);
  // State for the logical operators ('AND'/'OR') connecting the top-level ruleElements.
  const [topLevelOperators, setTopLevelOperators] = useState<('AND' | 'OR')[]>([]);
  // State for the generated KACE rule string.
  const [generatedRuleString, setGeneratedRuleString] = useState('');
  // State to indicate if the generated rule string has been copied to clipboard.
  const [copied, setCopied] = useState(false);
  // State to store validation errors, keyed by element ID.
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  // State for the text input when importing a rule.
  const [ruleInputText, setRuleInputText] = useState('');
  // State to store any error message during rule parsing/import.
  const [parsingError, setParsingError] = useState<string | null>(null);

  /**
   * Clears validation errors for a specific rule element.
   * @param elementId The ID of the element whose errors should be cleared.
   */
  const clearElementValidationErrors = (elementId: string) => {
    setValidationErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[elementId];
      return newErrors;
    });
  };

  /**
   * Adds a new top-level element (condition or group) to the rule.
   * @param type The type of element to add ('condition' or 'group').
   */
  const addTopLevelElement = (type: 'condition' | 'group') => {
    const newId = crypto.randomUUID();
    let newElement: KaceRuleElement;

    if (type === 'condition') {
      const defaultFunctionKey = Object.keys(KACE_FUNCTIONS)[0];
      newElement = {
        id: newId,
        type: 'condition',
        selectedFunctionKey: defaultFunctionKey,
        paramValues: getInitialParamValues(defaultFunctionKey),
      };
    } else { // group
      newElement = {
        id: newId,
        type: 'group',
        childrenJoinOperator: 'AND',
        children: [],
      };
    }

    setRuleElements(prevElements => {
      const updatedElements = [...prevElements, newElement];
      // Add a default 'AND' operator if this is not the first element.
      if (updatedElements.length > 1 && topLevelOperators.length < updatedElements.length - 1) {
        setTopLevelOperators(prevOps => [...prevOps, 'AND']);
      }
      return updatedElements;
    });
    // Reset generated string, parsing errors, and validation errors.
    setGeneratedRuleString('');
    setParsingError(null);
    setValidationErrors({});
  };
  
  /**
   * Recursively updates an element (condition or group) within the rule structure.
   * @param elements The array of elements to search within.
   * @param targetId The ID of the element to update.
   * @param updateFn A function that takes the found element and returns its updated version.
   * @returns The updated array of elements.
   */
  const updateElementRecursively = (
    elements: KaceRuleElement[],
    targetId: string,
    updateFn: (element: KaceRuleElement) => KaceRuleElement
  ): KaceRuleElement[] => {
    return elements.map(el => {
      if (el.id === targetId) {
        clearElementValidationErrors(targetId); // Clear validation for the modified element
        setParsingError(null); // Clear parsing error as user is modifying
        return updateFn(el);
      }
      // If the element is a group, recurse into its children.
      if (el.type === 'group') {
        return { ...el, children: updateElementRecursively(el.children, targetId, updateFn) };
      }
      return el;
    });
  };

  /**
   * Updates a top-level operator at a specific index.
   * @param index The index of the operator to update.
   * @param operator The new operator value ('AND' or 'OR').
   */
  const updateTopLevelOperator = (index: number, operator: 'AND' | 'OR') => {
    setTopLevelOperators(prevOps => prevOps.map((op, i) => (i === index ? operator : op)));
    setGeneratedRuleString('');
    setParsingError(null);
  };

  /**
   * Updates the selected KACE function for a specific condition.
   * @param conditionId The ID of the condition to update.
   * @param newFunctionKey The key of the new KACE function.
   */
  const updateConditionFunction = (conditionId: string, newFunctionKey: string) => {
    setRuleElements(prev => updateElementRecursively(prev, conditionId, (el) => {
      if (el.type === 'condition') {
        // Reset parameter values when function changes.
        return { ...el, selectedFunctionKey: newFunctionKey, paramValues: getInitialParamValues(newFunctionKey) };
      }
      return el;
    }));
    setGeneratedRuleString('');
    setParsingError(null);
  };

  /**
   * Updates a specific parameter value for a condition.
   * @param conditionId The ID of the condition.
   * @param paramName The name of the parameter to update.
   * @param value The new value for the parameter.
   */
  const updateConditionParam = (conditionId: string, paramName: string, value: string) => {
    setRuleElements(prev => updateElementRecursively(prev, conditionId, (el) => {
      if (el.type === 'condition') {
        return { ...el, paramValues: { ...el.paramValues, [paramName]: value } };
      }
      return el;
    }));
    setGeneratedRuleString('');
    setParsingError(null);
  };
  
  /**
   * Updates the join operator for the children of a specific group.
   * @param groupId The ID of the group to update.
   * @param operator The new join operator ('AND' or 'OR').
   */
  const updateGroupOperator = (groupId: string, operator: 'AND' | 'OR') => {
    setRuleElements(prev => updateElementRecursively(prev, groupId, (el) => {
      if (el.type === 'group') {
        return { ...el, childrenJoinOperator: operator };
      }
      return el;
    }));
    setGeneratedRuleString('');
    setParsingError(null);
  };

  /**
   * Removes an element (condition or group) from the rule structure by its ID.
   * @param idToRemove The ID of the element to remove.
   */
  const removeElementById = (idToRemove: string) => {
    const removeRecursively = (elements: KaceRuleElement[]): KaceRuleElement[] => {
      const filteredElements = elements.filter(el => el.id !== idToRemove);
      return filteredElements.map(el => {
        if (el.type === 'group') {
          return { ...el, children: removeRecursively(el.children) };
        }
        return el;
      });
    };
    setRuleElements(prevElements => {
      const newElements = removeRecursively(prevElements);
      // Adjust top-level operators after removal.
      if (newElements.length > 0) {
        setTopLevelOperators(currentOps => currentOps.slice(0, Math.max(0, newElements.length - 1)));
      } else {
        setTopLevelOperators([]);
      }
      return newElements;
    });
    clearElementValidationErrors(idToRemove); 
    setGeneratedRuleString('');
    setParsingError(null);
  };

  /**
   * Adds a new child element (condition or group) to a specific group.
   * @param groupId The ID of the parent group.
   * @param type The type of child element to add ('condition' or 'group').
   */
  const addChildToGroup = (groupId: string, type: 'condition' | 'group') => {
    const newChildId = crypto.randomUUID();
    let newChild: KaceRuleElement;
    if (type === 'condition') {
      const defaultFunctionKey = Object.keys(KACE_FUNCTIONS)[0];
      newChild = { id: newChildId, type: 'condition', selectedFunctionKey: defaultFunctionKey, paramValues: getInitialParamValues(defaultFunctionKey) };
    } else { // group
      newChild = { id: newChildId, type: 'group', childrenJoinOperator: 'AND', children: [] };
    }

    setRuleElements(prev => updateElementRecursively(prev, groupId, (el) => {
      if (el.type === 'group') {
        return { ...el, children: [...el.children, newChild] };
      }
      return el;
    }));
    setGeneratedRuleString('');
    setParsingError(null);
  };

  /**
   * Recursively generates the KACE rule string from the rule elements and operators.
   * Also performs validation and collects errors.
   * @param elements The current array of rule elements to process.
   * @param operators The operators connecting these elements.
   * @param currentValidationErrs A record to accumulate validation errors.
   * @returns An object containing the generated rule string part and a flag indicating if errors were found.
   */
  const generateKaceRuleStringInternal = (
    elements: KaceRuleElement[],
    operators: ('AND' | 'OR')[], 
    currentValidationErrs: Record<string, string[]>
  ): { rule: string; hasErrors: boolean } => {
    if (elements.length === 0) return { rule: '', hasErrors: false }; // Base case for recursion or empty group

    let overallHasErrors = false;
    const parts: string[] = []; // Stores string parts of conditions/groups

    elements.forEach((element, index) => {
      let elementStr = '';
      let elementHasErrors = false;

      if (element.type === 'condition') {
        const funcDef = KACE_FUNCTIONS[element.selectedFunctionKey];
        if (!funcDef) { 
            elementStr = `!INVALID_FUNCTION!`; // Should not happen with UI selection
            elementHasErrors = true; 
        } else {
          // Validate required parameters for the condition
          const conditionErrors: string[] = [];
          for (const paramDef of funcDef.params) {
            if (paramDef.required && !element.paramValues[paramDef.name]?.trim()) {
              conditionErrors.push(`Parameter "${paramDef.label}" is required.`);
              elementHasErrors = true;
            }
          }
          if (conditionErrors.length > 0) currentValidationErrs[element.id] = conditionErrors;
          
          if (!elementHasErrors) elementStr = funcDef.template(element.paramValues); // Generate string from template
          else elementStr = `!ERR!`; // Placeholder if validation fails
        }
      } else if (element.type === 'group') {
        // Recursively generate string for children of the group
        const groupChildOperators = Array(Math.max(0, element.children.length - 1)).fill(element.childrenJoinOperator);
        const groupResult = generateKaceRuleStringInternal(element.children, groupChildOperators, currentValidationErrs);
        
        if (element.children.length > 0) elementStr = `(${groupResult.rule})`; // Enclose group in parentheses
        else elementStr = ''; // Empty group results in empty string
        
        if (groupResult.hasErrors) elementHasErrors = true;
      }
      
      if (elementHasErrors) overallHasErrors = true;
      
      if (elementStr) parts.push(elementStr); // Add non-empty element string to parts

      // Add operator if it's not the last element and current element string is not empty
      if (index < operators.length && elementStr && parts.length > 0 && parts[parts.length-1] !== "AND" && parts[parts.length-1] !== "OR") {
        parts.push(operators[index]);
      }
    });

    // Clean up any trailing operator if the last element was empty or errored out
    if (parts.length > 0 && (parts[parts.length - 1] === "AND" || parts[parts.length - 1] === "OR")) parts.pop();
    
    return { rule: parts.join(' ').trim(), hasErrors: overallHasErrors };
  };

  /**
   * Initiates the KACE rule string generation process and updates component state.
   */
  const generateKaceRule = () => {
    const currentValidationErrs: Record<string, string[]> = {};
    const { rule, hasErrors } = generateKaceRuleStringInternal(ruleElements, topLevelOperators, currentValidationErrs);
    
    setValidationErrors(currentValidationErrs); // Update validation errors state
    if (hasErrors || Object.keys(currentValidationErrs).length > 0) setGeneratedRuleString(''); // Clear string if errors
    else setGeneratedRuleString(rule); // Set generated string if no errors
  };

  /**
   * Copies the generated KACE rule string to the clipboard.
   */
  const copyToClipboard = () => {
    if (!generatedRuleString) return;
    navigator.clipboard.writeText(generatedRuleString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset copied status after 2 seconds
  };

  // --- Rule Parsing Logic (for importing rules) ---

  /**
   * Splits a string by top-level delimiters ('AND', 'OR'), respecting parentheses.
   * @param str The string to split.
   * @param delimiters An array of delimiter strings.
   * @returns An object containing an array of parts and an array of operators.
   */
  const splitTopLevel = (str: string, delimiters: string[]): { parts: string[]; operators: ('AND' | 'OR')[] } => {
    const parts: string[] = [];
    const operators: ('AND' | 'OR')[] = [];
    let currentPart = "";
    let parenDepth = 0; // To track nesting level of parentheses
    let i = 0;

    while (i < str.length) {
        const char = str[i];
        if (char === '(') parenDepth++;
        else if (char === ')') parenDepth--;
        
        let foundDelimiter = false;
        if (parenDepth === 0) { // Only check for delimiters at the top level (outside parentheses)
            for (const delim of delimiters) {
                const spacedDelim = ` ${delim.toUpperCase()} `; // Ensure case-insensitivity and spacing
                if (str.substring(i).toUpperCase().startsWith(spacedDelim.trimStart())) {
                    if (currentPart.trim()) parts.push(currentPart.trim());
                    operators.push(delim as 'AND' | 'OR');
                    currentPart = "";
                    i += spacedDelim.trimStart().length; // Move index past the delimiter
                    foundDelimiter = true;
                    break; 
                }
            }
        }
        if (!foundDelimiter) {
            currentPart += char;
            i++;
        }
    }
    if (currentPart.trim()) { // Add any remaining part
        parts.push(currentPart.trim());
    }
    
    // Ensure operators array length is correct relative to parts
    if (operators.length >= parts.length && parts.length > 0) {
        operators.length = parts.length -1;
    } else if (parts.length === 0) {
        operators.length = 0;
    }
    return { parts, operators };
  };

  /**
   * Parses a single condition string (e.g., "FileExists(C:\file.txt)") into a KaceCondition object.
   * @param conditionStr The condition string to parse.
   * @returns A KaceCondition object or null if parsing fails.
   */
  const parseConditionString = (conditionStr: string): { result: KaceCondition | null; error: string | null } => {
    for (const [key, funcDef] of Object.entries(KACE_FUNCTIONS)) {
        if (funcDef.parseRegex) {
            const match = conditionStr.match(funcDef.parseRegex);
            if (match && match[1]) { 
                const paramsStr = match[1];
                const paramValuesArray = paramsStr.split(',').map(p => p.trim());
                const paramValues: Record<string, string> = {};

                if (key === 'RegistryKeyExists') {
                    if (paramValuesArray.length === 1) {
                        const fullPath = paramValuesArray[0];
                        const hiveIndex = KACE_REG_HIVES.findIndex(h => fullPath.toUpperCase().startsWith(h.toUpperCase() + '\\'));
                        if (hiveIndex > -1) {
                            paramValues[funcDef.params[0].name] = KACE_REG_HIVES[hiveIndex];
                            paramValues[funcDef.params[1].name] = fullPath.substring(KACE_REG_HIVES[hiveIndex].length + 1);
                        } else {
                            return { result: null, error: `Could not parse Hive (e.g., HKLM\\) from RegistryKeyExists path: "${fullPath}"` };
                        }
                    } else { 
                        return { result: null, error: `Invalid arguments for RegistryKeyExists: "${conditionStr}". Expected a single path argument like HIVE\\Path.`};
                    }
                } else if (key === 'RegistryValueEquals' || key === 'RegistryValueContains') {
                     if (paramValuesArray.length === funcDef.params.length -1) { // Expects combined path, valueName, valueData (3 string parts for 4 params)
                        const fullPath = paramValuesArray[0]; 
                        const hiveIndex = KACE_REG_HIVES.findIndex(h => fullPath.toUpperCase().startsWith(h.toUpperCase() + '\\'));
                        if (hiveIndex > -1) {
                            paramValues[funcDef.params[0].name] = KACE_REG_HIVES[hiveIndex]; 
                            paramValues[funcDef.params[1].name] = fullPath.substring(KACE_REG_HIVES[hiveIndex].length + 1); 
                        } else {
                            return { result: null, error: `Could not parse Hive (e.g., HKLM\\) for ${funcDef.displayName} from path: "${fullPath}"` };
                        }
                        paramValues[funcDef.params[2].name] = paramValuesArray[1]; 
                        paramValues[funcDef.params[3].name] = paramValuesArray[2]; 
                     } else { 
                        return { result: null, error: `Invalid argument count for ${funcDef.displayName}: "${conditionStr}". Expected combined Hive\\Path, ValueName, ValueData.`};
                     }
                }
                else if (paramValuesArray.length === funcDef.params.length) {
                    funcDef.params.forEach((paramDef, i) => {
                        paramValues[paramDef.name] = paramValuesArray[i];
                    });
                } else {
                    return { result: null, error: `Parameter count mismatch for ${funcDef.displayName}. Expected ${funcDef.params.length}, received ${paramValuesArray.length} from arguments: "${paramsStr}".` };
                }

                return {
                    result: {
                        id: crypto.randomUUID(),
                        type: 'condition',
                        selectedFunctionKey: key,
                        paramValues,
                    },
                    error: null
                };
            }
        }
    }
    return { result: null, error: `Unknown or malformed condition: "${conditionStr}"` };
  };

  /**
   * Recursively parses a segment of a KACE rule string into rule elements and operators.
   * @param segmentStr The rule string segment to parse.
   * @returns An object with parsed elements and operators, or null on failure.
   */
  const parseRuleSegment = (segmentStr: string): {
    elements: KaceRuleElement[] | null;
    operators: ('AND' | 'OR')[] | null;
    error: string | null;
    warning?: string | null; // Added to capture non-critical issues
  } => {
    const trimmedSegment = segmentStr.trim();
    if (!trimmedSegment) {
        return { elements: [], operators: [], error: null };
    }

    const { parts, operators: topOperators } = splitTopLevel(trimmedSegment, ['AND', 'OR']);
    const elements: KaceRuleElement[] = [];
    let parsingWarning: string | null = null;

    if (parts.length === 0 && trimmedSegment !== "") {
        parts.push(trimmedSegment);
    }

    for (const partStr of parts) {
        const trimmedPartStr = partStr.trim();
        if (trimmedPartStr.startsWith('(') && trimmedPartStr.endsWith(')')) {
            const groupContent = trimmedPartStr.substring(1, trimmedPartStr.length - 1);
            const parsedGroupResult = parseRuleSegment(groupContent);

            if (parsedGroupResult.error) {
                return { elements: null, operators: null, error: `Error within group "${trimmedPartStr.length > 40 ? trimmedPartStr.substring(0, 37) + '...' : trimmedPartStr}": ${parsedGroupResult.error}` };
            }
            if (parsedGroupResult.warning && !parsingWarning) { // Capture first warning from subgroups
                parsingWarning = `Warning in group "${trimmedPartStr.length > 40 ? trimmedPartStr.substring(0, 37) + '...' : trimmedPartStr}": ${parsedGroupResult.warning}`;
            }

            if (parsedGroupResult.elements) {
                let groupOp: 'AND' | 'OR' = 'AND';
                if (parsedGroupResult.operators && parsedGroupResult.operators.length > 0) {
                    groupOp = parsedGroupResult.operators[0];
                    if (!parsedGroupResult.operators.every(op => op === groupOp)) {
                        // Capture this as a warning instead of console.warn
                        const mixedOpWarning = `Mixed AND/OR operators found within group level: "${groupContent.length > 30 ? groupContent.substring(0,27)+'...' : groupContent}". The parser used the first operator ('${groupOp}') for this group. Review generated rule.`;
                        if (!parsingWarning) parsingWarning = mixedOpWarning;
                        else parsingWarning += `\n${mixedOpWarning}`;
                    }
                }
                elements.push({
                    id: crypto.randomUUID(),
                    type: 'group',
                    childrenJoinOperator: groupOp,
                    children: parsedGroupResult.elements,
                });
            } else {
                 return { elements: null, operators: null, error: `Failed to parse content of group: "${trimmedPartStr}"` };
            }
        } else {
            const conditionResult = parseConditionString(trimmedPartStr);
            if (conditionResult.error) {
                return { elements: null, operators: null, error: `Error in condition "${trimmedPartStr.length > 40 ? trimmedPartStr.substring(0, 37) + '...' : trimmedPartStr}": ${conditionResult.error}` };
            }
            if (conditionResult.result) {
                elements.push(conditionResult.result);
            } else {
                return { elements: null, operators: null, error: `Unknown error parsing condition: "${trimmedPartStr}"` };
            }
        }
    }
    return { elements, operators: topOperators, error: null, warning: parsingWarning };
  };

  /**
   * Handles the import of a KACE rule string from the text input.
   * Parses the string and updates the component state.
   */
  const handleImportRule = () => {
    setParsingError(null);
    setValidationErrors({});
    setGeneratedRuleString('');

    const trimmedRuleInput = ruleInputText.trim();
    if (!trimmedRuleInput) {
      setRuleElements([]);
      setTopLevelOperators([]);
      return;
    }

    const parsedResult = parseRuleSegment(trimmedRuleInput);

    let currentError = parsedResult.error;
    if (parsedResult.warning) {
        if (currentError) {
            currentError += `\n\nAdditionally: ${parsedResult.warning}`;
        } else {
            currentError = `Warning: ${parsedResult.warning}`;
        }
    }

    if (currentError) {
      setParsingError(currentError);
      setRuleElements([]);
      setTopLevelOperators([]);
    } else if (parsedResult.elements && parsedResult.operators) {
      setRuleElements(parsedResult.elements);
      setTopLevelOperators(parsedResult.operators);
      setParsingError(null); 
    } else {
      setParsingError("Failed to parse the rule string. The structure might be invalid or an unknown error occurred.");
      setRuleElements([]);
      setTopLevelOperators([]);
    }
  };

  // --- JSX Rendering ---
  return (
    <main className="min-h-screen bg-gray-950 flex flex-col items-center px-2 pb-20" style={{ paddingTop: '5.5rem' }}>
      <div className="w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-white">Quest KACE Custom Inventory Rule Builder</h1>
        <p className="text-blue-400 text-center mb-6 text-sm">
          Build or import KACE inventory rules.
        </p>

        {/* Import Rule Section */}
        <div className="mb-8 p-5 bg-slate-800/70 rounded-lg border border-slate-700">
            <h2 className="text-xl font-semibold text-white mb-3">Import Existing KACE Rule</h2>
            <textarea
                value={ruleInputText}
                onChange={(e) => setRuleInputText(e.target.value)}
                placeholder="Paste your KACE CIR string here... e.g., FileExists(C:\Path\To\File.exe) AND (FileVersion(C:\Path\To\Other.dll, >=, 1.2.3) OR RegistryKeyExists(HKLM\Software\MyCompany))"
                className="w-full bg-slate-900 text-slate-200 rounded px-3 py-2 border border-slate-600 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] text-sm"
                rows={4}
            />
            <button
                onClick={handleImportRule}
                className="mt-3 w-full sm:w-auto flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-500 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
            >
                <DocumentArrowDownIcon className="h-5 w-5" /> Import Rule from Text
            </button>
            {parsingError && (
                <div className="mt-3 p-3 bg-red-900/50 border border-red-700/70 rounded-md text-sm text-red-300">
                    <ExclamationTriangleIcon className="h-5 w-5 inline mr-2" /> {parsingError}
                </div>
            )}
        </div>

        {/* Rule Element Renderer: Displays the interactive rule builder UI */}
        <RuleElementRenderer
          elements={ruleElements}
          operators={topLevelOperators}
          onUpdateOperator={updateTopLevelOperator}
          onRemoveElement={removeElementById}
          onUpdateConditionFunction={updateConditionFunction}
          onUpdateConditionParam={updateConditionParam}
          onUpdateGroupOperator={updateGroupOperator}
          onAddChildToGroup={addChildToGroup}
          validationErrors={validationErrors}
          isTopLevel={true} // Indicates this is the root level renderer
        />

        {/* Buttons to add top-level conditions or groups */}
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => addTopLevelElement('condition')}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
          >
            <Bars3BottomLeftIcon className="h-5 w-5" /> Add Top-Level Condition
          </button>
          <button
            onClick={() => addTopLevelElement('group')}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-4 py-2.5 rounded-lg font-semibold transition-colors"
          >
            <RectangleGroupIcon className="h-5 w-5" /> Add Top-Level Group
          </button>
        </div>

        {/* Section to display the generated rule string */}
        {ruleElements.length > 0 && (
          <div className="mt-8">
            <button
              onClick={generateKaceRule}
              className="w-full bg-green-600 hover:bg-green-500 text-white px-4 py-2.5 rounded-lg font-semibold mb-4 transition-colors"
            >
              Generate KACE Rule String
            </button>
            {generatedRuleString && !Object.values(validationErrors).some(errors => errors.length > 0) && (
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-lg font-semibold text-slate-200">Generated Rule:</h3>
                  <button
                    onClick={copyToClipboard}
                    className="text-sm bg-slate-700 hover:bg-slate-600 text-slate-300 px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors"
                    title="Copy to clipboard"
                  >
                    {copied ? <ClipboardDocumentCheckIcon className="h-5 w-5 text-green-400" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="text-slate-300 text-sm whitespace-pre-wrap bg-slate-900 p-3 rounded-md overflow-x-auto">
                  {generatedRuleString}
                </pre>
              </div>
            )}
          </div>
        )}
        
        {/* Footer/Informational Text */}
        <div className="text-slate-500 text-xs mt-8 text-center">
          <p>
            This tool helps construct custom inventory rules for Quest KACE. The generated string can be pasted into the KACE SMA.
          </p>
          <p className="mt-1">
            Required fields are marked with <span className="text-red-500">*</span>. Empty groups will be omitted from the output.
            The importer is experimental and works best with rules generated by this tool or simple KACE rules.
          </p>
        </div>
      </div>
    </main>
  )
}

// --- Recursive Rule Element Renderer Component ---
// This component is responsible for rendering each part of the rule (conditions and groups)
// and allows for nested rendering of groups.

interface RuleElementRendererProps {
  elements: KaceRuleElement[]; // The current list of elements (conditions/groups) to render
  operators: ('AND' | 'OR')[]; // Operators connecting these 'elements'
  // Callbacks to update the main state in the parent component
  onUpdateOperator: (index: number, operator: 'AND' | 'OR', isGroupChildOperator?: boolean, groupId?: string) => void;
  onRemoveElement: (id: string) => void;
  onUpdateConditionFunction: (conditionId: string, newFunctionKey: string) => void;
  onUpdateConditionParam: (conditionId: string, paramName: string, value: string) => void;
  onUpdateGroupOperator: (groupId: string, operator: 'AND' | 'OR') => void;
  onAddChildToGroup: (groupId: string, type: 'condition' | 'group') => void;
  validationErrors: Record<string, string[]>; // Validation errors for display
  isTopLevel: boolean; // Flag to indicate if this is the top-level rendering pass
  depth?: number; // Current nesting depth (for styling or debugging)
}

const RuleElementRenderer: React.FC<RuleElementRendererProps> = ({
  elements,
  operators, 
  onUpdateOperator,
  onRemoveElement,
  onUpdateConditionFunction,
  onUpdateConditionParam,
  onUpdateGroupOperator,
  onAddChildToGroup,
  validationErrors,
  isTopLevel,
  depth = 0
}) => {
  return (
    <div className={`space-y-4 ${!isTopLevel ? 'pl-4 mt-3 border-l-2 border-slate-700' : ''}`}> {/* Indent nested groups */}
      {elements.map((element, index) => (
        <Fragment key={element.id}> {/* Use Fragment to avoid extra div for key */}
          {/* Container for each rule element (condition or group) */}
          <div className={`p-4 rounded-md border relative ${element.type === 'group' ? 'bg-slate-700/40 border-slate-600' : 'bg-slate-800/60 border-slate-700'}`}>
            {/* Remove button for the element */}
            <button
              onClick={() => onRemoveElement(element.id)}
              className="absolute top-2.5 right-2.5 text-slate-500 hover:text-red-400 transition-colors p-1"
              title="Remove this item"
            >
              <TrashIcon className="h-4 w-4" />
            </button>

            {/* Render content if the element is a Condition */}
            {element.type === 'condition' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3">
                  {/* Dropdown to select KACE function type */}
                  <div>
                    <label htmlFor={`func-${element.id}`} className="block text-slate-300 text-sm font-medium mb-1">
                      Condition Type
                    </label>
                    <select
                      id={`func-${element.id}`}
                      value={element.selectedFunctionKey}
                      onChange={(e: ChangeEvent<HTMLSelectElement>) => onUpdateConditionFunction(element.id, e.target.value)}
                      className="w-full bg-slate-900 text-slate-200 rounded px-3 py-2 border border-slate-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                      {Object.entries(KACE_FUNCTIONS).map(([key, funcDef]) => (
                        <option key={key} value={key}>{funcDef.displayName}</option>
                      ))}
                    </select>
                  </div>
                  {/* Render input fields for each parameter of the selected function */}
                  {KACE_FUNCTIONS[element.selectedFunctionKey]?.params.map(param => (
                    <div key={param.name}>
                      <label htmlFor={`${element.id}-${param.name}`} className="block text-slate-300 text-sm font-medium mb-1">
                        {param.label} {param.required && <span className="text-red-500">*</span>}
                      </label>
                      {param.type === 'select' ? (
                        <select
                          id={`${element.id}-${param.name}`}
                          value={element.paramValues[param.name] || param.defaultValue}
                          onChange={(e: ChangeEvent<HTMLSelectElement>) => onUpdateConditionParam(element.id, param.name, e.target.value)}
                          className="w-full bg-slate-900 text-slate-200 rounded px-3 py-2 border border-slate-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        >
                          {param.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      ) : (
                        <input
                          type={param.type}
                          id={`${element.id}-${param.name}`}
                          placeholder={param.placeholder}
                          value={element.paramValues[param.name] || ''}
                          onChange={(e: ChangeEvent<HTMLInputElement>) => onUpdateConditionParam(element.id, param.name, e.target.value)}
                          className="w-full bg-slate-900 text-slate-200 rounded px-3 py-2 border border-slate-600 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Render content if the element is a Group */}
            {element.type === 'group' && (
              <div>
                {/* Dropdown to select the join operator for children of this group */}
                <div className="flex items-center mb-3">
                  <span className="mr-2 text-slate-300 text-sm font-semibold">Group: Join children with</span>
                  <select 
                    value={element.childrenJoinOperator} 
                    onChange={(e: ChangeEvent<HTMLSelectElement>) => onUpdateGroupOperator(element.id, e.target.value as 'AND' | 'OR')}
                    className="bg-slate-600 text-slate-200 rounded px-2 py-1 border border-slate-500 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  >
                    <option value="AND">AND</option>
                    <option value="OR">OR</option>
                  </select>
                </div>
                {/* Recursively call RuleElementRenderer for children of this group */}
                <RuleElementRenderer
                  elements={element.children}
                  // Operators for children are determined by the group's childrenJoinOperator
                  operators={Array(Math.max(0, element.children.length - 1)).fill(element.childrenJoinOperator)} 
                  onUpdateOperator={() => { /* Not directly editable for group children via this select in current design */}}
                  onRemoveElement={onRemoveElement}
                  onUpdateConditionFunction={onUpdateConditionFunction}
                  onUpdateConditionParam={onUpdateConditionParam}
                  onUpdateGroupOperator={onUpdateGroupOperator}
                  onAddChildToGroup={onAddChildToGroup}
                  validationErrors={validationErrors}
                  isTopLevel={false} // Children are not top-level
                  depth={depth + 1} // Increment depth for nesting
                />
                {/* Buttons to add new conditions or sub-groups to this group */}
                <div className="mt-3 pt-3 border-t border-slate-600/50 flex flex-col sm:flex-row gap-2">
                  <button 
                    onClick={() => onAddChildToGroup(element.id, 'condition')}
                    className="flex-1 text-xs flex items-center justify-center gap-1 bg-blue-700/70 hover:bg-blue-600/70 text-blue-200 px-2 py-1.5 rounded font-medium"
                  ><Bars3BottomLeftIcon className="h-3.5 w-3.5" /> Add Condition to Group</button>
                  <button 
                    onClick={() => onAddChildToGroup(element.id, 'group')}
                    className="flex-1 text-xs flex items-center justify-center gap-1 bg-purple-700/70 hover:bg-purple-600/70 text-purple-200 px-2 py-1.5 rounded font-medium"
                  ><RectangleGroupIcon className="h-3.5 w-3.5" /> Add Group to Group</button>
                </div>
              </div>
            )}
            {/* Display validation errors for this element, if any */}
            {validationErrors[element.id] && validationErrors[element.id].length > 0 && (
              <div className="mt-2 p-2.5 bg-red-900/40 border border-red-700/60 rounded-md text-xs">
                {validationErrors[element.id].map((error, i) => (
                  <div key={i} className="flex items-center text-red-400">
                    <ExclamationTriangleIcon className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                    {error}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Render the operator (AND/OR) connecting this element to the next one in the list */}
          {/* Only render if it's not the last element and there's an operator for this position */}
          {index < operators.length && elements.length > 1 && ( 
            <div className="flex justify-center my-3">
              {isTopLevel ? ( // Top-level operators are editable
                <select 
                  value={operators[index]} 
                  onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                      onUpdateOperator(index, e.target.value as 'AND' | 'OR');
                  }}
                  className="bg-slate-600 text-slate-100 rounded px-3 py-1.5 border border-slate-500 text-sm font-medium hover:bg-slate-500"
                >
                  <option value="AND">AND</option>
                  <option value="OR">OR</option>
                </select>
              ) : ( // Operators between children of a group are displayed as static text (derived from group's operator)
                <div className="px-3 py-1.5 text-slate-400 text-sm font-medium">
                  {operators[index]}
                </div>
              )}
            </div>
          )}
        </Fragment>
      ))}
    </div>
  );
};