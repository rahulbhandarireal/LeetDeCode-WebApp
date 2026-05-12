import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlay, faCheck, faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { testRunners, wandboxLanguageMap } from '../utils/testRunners';

const defaultCode = {
  python: `def twoSum(nums, target):\n    # Write your code here\n    pass`,
  cpp: `#include <vector>\nusing namespace std;\n\nclass Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Write your code here\n        \n    }\n};`,
  java: `class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Write your code here\n        return new int[]{};\n    }\n}`
};

export default function IDE() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(defaultCode.python);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);

  // Splitter states
  const [leftWidth, setLeftWidth] = useState(33.33); // Percentage
  const [consoleHeight, setConsoleHeight] = useState(256); // Pixels
  const [dragAxis, setDragAxis] = useState(null); // 'vertical' or 'horizontal'

  const startDragVertical = (e) => {
    e.preventDefault();
    setDragAxis('vertical');
    const handleMouseMove = (moveEvent) => {
      const newWidth = (moveEvent.clientX / window.innerWidth) * 100;
      if (newWidth > 20 && newWidth < 80) setLeftWidth(newWidth);
    };
    const handleMouseUp = () => {
      setDragAxis(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const startDragHorizontal = (e) => {
    e.preventDefault();
    setDragAxis('horizontal');
    const handleMouseMove = (moveEvent) => {
      // IDE container has 80px offset for navbar, 16px bottom padding
      const newHeight = window.innerHeight - moveEvent.clientY - 16;
      if (newHeight > 100 && newHeight < window.innerHeight - 200) {
        setConsoleHeight(newHeight);
      }
    };
    const handleMouseUp = () => {
      setDragAxis(null);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(defaultCode[newLang]);
    setTestResults(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      setCode(code.substring(0, start) + "    " + code.substring(end));
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const runCode = async () => {
    setIsRunning(true);
    setTestResults(null);

    const fullCode = code + "\n" + testRunners[language];
    const compilerName = wandboxLanguageMap[language];

    try {
      const response = await fetch('https://wandbox.org/api/compile.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          compiler: compilerName,
          code: fullCode
        }),
      });

      const result = await response.json();
      
      if (result.compiler_error && result.compiler_error.trim() !== '') {
        setTestResults({
          status: 'Compilation Error',
          errorMsg: result.compiler_error,
          cases: []
        });
        setIsRunning(false);
        return;
      }

      const programOutput = result.program_output || "";
      const programError = result.program_error || "";

      if (result.status !== "0" && !programOutput.includes("###TC###")) {
        setTestResults({
          status: 'Runtime Error',
          errorMsg: programError || programOutput,
          cases: []
        });
        setIsRunning(false);
        return;
      }

      // Parse output
      const outputLines = programOutput.split('\n');
      const parsedCases = [];
      let allPassed = true;

      for (let line of outputLines) {
        if (line.startsWith("###TC###")) {
          const parts = line.split("###");
          if (parts.length >= 7) {
            const name = parts[2];
            const status = parts[3]; // PASS, FAIL, ERROR
            const out = parts[4];
            const exp = parts[5];
            const visibility = parts[6];

            if (status !== 'PASS') allPassed = false;
            
            parsedCases.push({
              name,
              passed: status === 'PASS',
              output: out,
              expected: exp,
              hidden: visibility === 'HIDDEN',
              error: status === 'ERROR'
            });
          }
        }
      }

      if (parsedCases.length === 0) {
        setTestResults({
          status: 'Runtime Error',
          errorMsg: programError || programOutput || "No output generated. Did you change the function signature?",
          cases: []
        });
      } else {
        setTestResults({
          status: allPassed ? 'Accepted' : 'Wrong Answer',
          cases: parsedCases
        });
      }
      
    } catch (err) {
      setTestResults({
        status: 'API Error',
        errorMsg: "Failed to connect to compilation server.",
        cases: []
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className={`h-[calc(100vh-80px)] flex bg-[var(--color-background)] text-white font-body p-4 ${dragAxis ? 'select-none' : ''}`}>
      
      {dragAxis && (
        <div className={`fixed inset-0 z-50 ${dragAxis === 'vertical' ? 'cursor-col-resize' : 'cursor-row-resize'}`} />
      )}

      {/* Left Panel: Problem Description */}
      <div style={{ width: `${leftWidth}%` }} className="bg-[var(--component-surface)] rounded-xl border border-[#2a2a2a] p-6 overflow-y-auto flex flex-col gap-4">
        <h1 className="text-3xl font-headline font-bold">1. Two Sum</h1>
        <div className="flex gap-2">
          <span className="text-[var(--color-easy)] bg-[#22c55e]/10 px-2 py-1 rounded-md text-sm font-semibold">Easy</span>
        </div>
        
        <p className="text-neutral-300 mt-4 leading-relaxed">
          Given an array of integers <code className="bg-[#2a2a2a] px-1 rounded text-[var(--color-logo)]">nums</code> and an integer <code className="bg-[#2a2a2a] px-1 rounded text-[var(--color-logo)]">target</code>, return indices of the two numbers such that they add up to <code className="bg-[#2a2a2a] px-1 rounded text-[var(--color-logo)]">target</code>.
        </p>
        <p className="text-neutral-300 leading-relaxed">
          You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the same element twice.
        </p>

        <div className="mt-4 flex flex-col gap-4">
          <div className="bg-[#1a1a1a] p-4 rounded-lg">
            <p className="font-bold mb-2">Example 1:</p>
            <p className="text-neutral-300 text-sm font-mono">
              <strong>Input:</strong> nums = [2,7,11,15], target = 9<br/>
              <strong>Output:</strong> [0,1]<br/>
              <strong>Explanation:</strong> Because nums[0] + nums[1] == 9, we return [0, 1].
            </p>
          </div>
        </div>
      </div>

      {/* Vertical Splitter */}
      <div 
        className="w-4 cursor-col-resize flex items-center justify-center z-10 group"
        onMouseDown={startDragVertical}
      >
        <div className="w-1 h-1/6 bg-[#2a2a2a] group-hover:bg-[var(--color-logo)] rounded transition-colors" />
      </div>

      {/* Right Panel: Editor and Console */}
      <div style={{ width: `calc(${100 - leftWidth}% - 16px)` }} className="flex flex-col">
        
        {/* Editor Top Section */}
        <div className="flex-1 bg-[var(--component-surface)] rounded-xl border border-[#2a2a2a] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2 border-b border-[#2a2a2a]">
            <select 
              className="bg-transparent text-neutral-300 font-semibold outline-none cursor-pointer"
              value={language}
              onChange={handleLanguageChange}
            >
              <option value="python">Python</option>
              <option value="cpp">C++</option>
              <option value="java">Java</option>
            </select>
            <div className="text-neutral-500 text-sm">Simple IDE</div>
          </div>
          
          <textarea 
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            className="flex-1 w-full bg-transparent text-neutral-200 font-mono p-4 resize-none outline-none leading-relaxed"
          />
        </div>

        {/* Horizontal Splitter */}
        <div 
          className="h-4 cursor-row-resize flex items-center justify-center z-10 group"
          onMouseDown={startDragHorizontal}
        >
          <div className="h-1 w-1/6 bg-[#2a2a2a] group-hover:bg-[var(--color-logo)] rounded transition-colors" />
        </div>

        {/* Console Bottom Section */}
        <div style={{ height: `${consoleHeight}px` }} className="bg-[var(--component-surface)] rounded-xl border border-[#2a2a2a] flex flex-col overflow-hidden">
          <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2 border-b border-[#2a2a2a]">
            <span className="text-neutral-300 font-semibold">Test Cases</span>
            <button 
              onClick={runCode}
              disabled={isRunning}
              className={`flex items-center gap-2 px-4 py-1 rounded bg-[var(--color-logo)] text-white font-semibold transition ${isRunning ? 'opacity-50' : 'hover:scale-105'}`}
            >
              {isRunning ? <FontAwesomeIcon icon={faSpinner} spin /> : <FontAwesomeIcon icon={faPlay} />}
              Run Code
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            {!testResults && !isRunning && (
              <div className="text-neutral-500 h-full flex items-center justify-center">
                Click "Run Code" to execute test cases
              </div>
            )}
            
            {isRunning && (
              <div className="text-[var(--color-logo)] h-full flex items-center justify-center font-mono">
                Executing code...
              </div>
            )}

            {testResults && (
              <div className="flex flex-col gap-4">
                <h3 className={`text-xl font-bold ${
                  testResults.status === 'Accepted' ? 'text-[var(--color-easy)]' : 
                  testResults.status === 'Wrong Answer' ? 'text-[var(--color-hard)]' : 
                  'text-yellow-500'
                }`}>
                  {testResults.status}
                </h3>
                
                {testResults.errorMsg && (
                  <div className="bg-[#1a1a1a] p-4 rounded border border-red-500/30 text-red-400 font-mono text-sm whitespace-pre-wrap">
                    {testResults.errorMsg}
                  </div>
                )}
                
                <div className="flex flex-col gap-3">
                  {testResults.cases.map((tc, i) => (
                    <div key={i} className={`bg-[#1a1a1a] p-3 rounded border ${tc.passed ? 'border-[#22c55e]/30' : 'border-[#ef4444]/30'}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <FontAwesomeIcon icon={tc.passed ? faCheck : faTimes} className={tc.passed ? 'text-[var(--color-easy)]' : 'text-[var(--color-hard)]'} />
                        <span className="font-semibold">{tc.name} {tc.hidden && <span className="text-xs ml-2 bg-[#2a2a2a] px-2 py-1 rounded text-neutral-400">Hidden</span>}</span>
                      </div>
                      
                      {!tc.hidden || (!tc.passed && !tc.error) ? (
                        <div className="text-sm font-mono text-neutral-400 grid gap-1">
                          {tc.error ? (
                             <div><span className="text-red-400">Error:</span> {tc.output}</div>
                          ) : (
                             <>
                              <div><span className="text-neutral-500">Expected:</span> {tc.expected}</div>
                              <div><span className="text-neutral-500">Output:</span> <span className={tc.passed ? 'text-neutral-400' : 'text-[var(--color-hard)]'}>{tc.output}</span></div>
                             </>
                          )}
                        </div>
                      ) : tc.error ? (
                        <div className="text-sm font-mono text-red-400">Error: {tc.output}</div>
                      ) : (
                        <div className="text-sm text-neutral-500 italic">Hidden test case passed</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
