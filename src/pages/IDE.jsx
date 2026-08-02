import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { Panel, Group, Separator } from "react-resizable-panels";
import { ENDPOINTS } from "../config/api";

const BOILERPLATES = {
  CPP: `// write your code here\n#include <iostream>\nusing namespace std;\n\nint main() {\n    return 0;\n}`,
  JAVA: `// write your code here\nimport java.util.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        \n    }\n}`,
  PYTHON: `# write your code here\ndef main():\n    pass\n\nif __name__ == "__main__":\n    main()\n`
};

function IDE() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const roomId = location.state?.roomId || searchParams.get('roomId');
  const problemId = location.state?.problemId || searchParams.get('problemId');
  const opponent = searchParams.get('opponent');

  const [question, setQuestion] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);

  const [canLeave, setCanLeave] = useState(false);
  const [language, setLanguage] = useState("CPP");
  const [code, setCode] = useState(BOILERPLATES["CPP"]);
  const [runResults, setRunResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);

  const [activeBottomTab, setActiveBottomTab] = useState("testcases"); // "testcases" | "submissions"
  const [submissionsHistory, setSubmissionsHistory] = useState([]);
  const [selectedSubmissionModal, setSelectedSubmissionModal] = useState(null);
  const [battleResult, setBattleResult] = useState(null); // null | "win" | "lose"

  const handleLanguageChange = (e) => {
    const selectedLang = e.target.value;
    setLanguage(selectedLang);
    setCode(BOILERPLATES[selectedLang] || "// write your code here");
  };

  // Fetch question from backend API getproblem/ai/?problemId={problemId}
  useEffect(() => {
    const fetchProblem = async () => {
      let targetProblemId = problemId;

      // If problemId is missing, try fetching it from room status using roomId
      if ((targetProblemId === null || targetProblemId === undefined || targetProblemId === '') && roomId) {
        try {
          const roomRes = await fetch(ENDPOINTS.roomStatus(roomId));
          if (roomRes.ok) {
            const roomDataJson = await roomRes.json();
            const room = roomDataJson.data;
            targetProblemId = room.problemId ;
          }
        } catch (rErr) {
          console.error("Could not fetch room status for problemId fallback:", rErr);
        }
      }

      if (targetProblemId === null || targetProblemId === undefined || targetProblemId === '') {
        console.warn("No problemId available to fetch problem details.");
        return;
      }

      setLoadingQuestion(true);
      try {
        const response = await fetch(ENDPOINTS.getProblem(targetProblemId));
        if (!response.ok) {
          throw new Error(`Failed to fetch problem (${response.status})`);
        }
        const resData = await response.json();
        
        // Response structure: ApiResponse<T> { boolean status, String message, T data }
        if (resData && resData.status && resData.data) {
          setQuestion(resData.data);
        }else {
          console.error("Failed to load problem data:", resData?.message || "Unknown error");
        }
      } catch (err) {
        console.error("Error fetching problem:", err);
      } finally {
        setLoadingQuestion(false);
      }
    };

    fetchProblem();
  }, [problemId, roomId]);

  useEffect(() => {
    if (!roomId) return;

    const handleBeforeUnload = (e) => {
      if (!canLeave) {
        e.preventDefault();
        e.returnValue = "You are in a battle. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [roomId, navigate, canLeave]);

  const handleExit = async () => {
    if (window.confirm("Are you sure you want to exit the battle?")) {
    const rawSampleCases = question?.sampleTestCases || (question?.testCases ? question.testCases.slice(0, 2) : []);
    const formattedTestCases = formatTestCases(rawSampleCases);
      const payload = {
      language: language,
      code: code,
      testCases: formattedTestCases,
      negativeScore: submissionsHistory.length,
      roomCode: roomId,
      problemId: problemId,
      playerId: localStorage.getItem("name")
    };

    try {
      const response = await fetch(ENDPOINTS.forceSubmit(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

    } catch (err) {
      console.error("Error executing Run Code:", err);
    }
      setCanLeave(true);
      setTimeout(() => navigate('/Battle'), 0);
    }
  };

  const formatTestCases = (casesList) => {
    if (!Array.isArray(casesList)) return [];
    return casesList.map((tc) => {
      if (typeof tc === 'object' && tc !== null) {
        return {
          input: tc.input !== undefined ? String(tc.input) : (tc.inputData !== undefined ? String(tc.inputData) : JSON.stringify(tc)),
          expectedOutput: tc.expectedOutput !== undefined ? String(tc.expectedOutput) : (tc.output !== undefined ? String(tc.output) : "")
        };
      }
      return {
        input: String(tc),
        expectedOutput: ""
      };
    });
  };

  const handleRunCode = async () => {
    const rawSampleCases = question?.sampleTestCases || (question?.testCases ? question.testCases.slice(0, 2) : []);
    const formattedTestCases = formatTestCases(rawSampleCases);

    const payload = {
      language: language,
      code: code,
      testCases: formattedTestCases,
      negativeScore: submissionsHistory.length,
      roomCode: roomId,
      problemId: problemId,
      playerId: localStorage.getItem("name")
    };

    console.log("Sending Run Code Request payload:", payload);
    setIsRunning(true);

    try {
      const response = await fetch(ENDPOINTS.runSample(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("Run Code Result from backend:", data);
      const resultsList = Array.isArray(data) ? data : (data.data || []);
      setRunResults(resultsList);
      setActiveBottomTab("testcases");
    } catch (err) {
      console.error("Error executing Run Code:", err);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    let rawAllCases = [];
    if (question?.testCases && question.testCases.length > 0) {
      rawAllCases = question.testCases;
    } else {
      const samples = question?.sampleTestCases || [];
      const hiddens = question?.hiddenTestCases || question?.realTestCases || question?.originalTestCases || [];
      rawAllCases = [...samples, ...hiddens];
    }

    const formattedTestCases = formatTestCases(rawAllCases);

    const payload = {
      language: language,
      code: code,
      testCases: formattedTestCases,
      negativeScore: submissionsHistory.length,
      roomCode: roomId,
      problemId: problemId,
      playerId: localStorage.getItem("name")
    };

    console.log("Sending Submit Code Request payload:", payload);
    setIsRunning(true);

    try {
      const response = await fetch(ENDPOINTS.runSubmit(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const data = await response.json();
      console.log("Submit Code Result from backend (raw):", JSON.stringify(data));
      console.log("data.data:", data?.data, "| Array.isArray:", Array.isArray(data?.data));

      console.log(data);
      // Check for win/lose message from backend
      if(data.allPassed){
        if(data.winner){
          setBattleResult("win");
        }else{
          setBattleResult("lose");
        }
        setCanLeave(true)
      }

      const resultsList = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      setRunResults(resultsList);

      let passedCount = 0;
      let isAnyTLE = false;
      let isAnyError = false;

      resultsList.forEach((r, idx) => {
        const expected = r.expectedOutput ?? (rawAllCases[idx]?.output || rawAllCases[idx]?.expectedOutput || "");
        const actual = r.actualOutput !== undefined && r.actualOutput !== null ? String(r.actualOutput) : "";
        const isPassed = Boolean(r.passed) && !r.timedOut && actual.trim() === String(expected).trim();

        if (isPassed) {
          passedCount++;
        } else {
          if (r.timedOut) isAnyTLE = true;
          if (r.error && String(r.error).trim().length > 0) isAnyError = true;
        }
      });

      const totalCases = resultsList.length || formattedTestCases.length;

      const isAllPassed =data.allPassed

      const statusStr = isAllPassed
        ? "Accepted"
        : isAnyTLE
        ? "Time Limit Exceeded"
        : isAnyError
        ? "Runtime Error"
        : "Wrong Answer";

      const subRecord = {
        id: Date.now(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        language: language,
        status: statusStr,
        passedCount: passedCount,
        totalCount: totalCases || rawAllCases.length,
        results: resultsList,
        isAllPassed: isAllPassed
      };

      console.log("subRecord being added:", subRecord);

      setSubmissionsHistory((prev) => [subRecord, ...prev]);
      setSelectedSubmissionModal(subRecord);
      setActiveBottomTab("submissions");

    } catch (err) {
      console.error("Error executing Submit Code:", err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#0d0d0d] text-gray-300">
      {roomId && (
        <div className="bg-[#1a1a1a] border-b border-gray-800 p-2 text-center text-sm font-bold text-green-400 tracking-wider flex justify-between items-center px-4">
          <div className="flex items-center gap-2">
            {opponent && (
              <span className="text-gray-400 text-xs bg-gray-800 px-2 py-1 rounded border border-gray-700">
                Opponent: <span className="text-white">@{opponent}</span>
              </span>
            )}
          </div>
          <div>
            BATTLE ROOM: <span className="text-white mr-4">{roomId}</span>
          </div>
          <button onClick={handleExit} className="text-xs bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">
            Exit Battle
          </button>
        </div>
      )}
      <div className="flex-1 p-2 flex overflow-hidden">
        <Group orientation="horizontal" className="flex-1">
          {/* Left Pane: Problem Statement & Sample Test Cases */}
          <Panel defaultSize={50} minSize={20} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 flex flex-col overflow-hidden">
            {loadingQuestion ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p>Loading problem statement...</p>
              </div>
            ) : question ? (
              <div className="flex-1 overflow-y-auto pr-2">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-2xl font-bold text-white">{question.title || "Problem Statement"}</h2>
                  {question.level && (
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      question.level.toLowerCase() === 'easy' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      question.level.toLowerCase() === 'medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}>
                      {question.level}
                    </span>
                  )}
                  {question.topic && (
                    <span className="bg-blue-500/20 text-blue-400 text-xs px-2.5 py-0.5 rounded-full border border-blue-500/30 font-semibold">
                      {question.topic}
                    </span>
                  )}
                </div>

                <div className="text-gray-300 text-sm leading-relaxed mb-6 whitespace-pre-wrap">
                  {question.problemStatement || "No description provided."}
                </div>

                {question.constraint && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-sm uppercase text-gray-400 mb-2">Constraints</h3>
                    <div className="bg-[#0d0d0d] border border-gray-800 p-3 rounded-md text-xs font-mono text-gray-300 whitespace-pre-wrap">
                      {question.constraint}
                    </div>
                  </div>
                )}

                {question.sampleTestCases && question.sampleTestCases.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-sm uppercase text-gray-400 mb-3">Sample Test Cases</h3>
                    <div className="flex flex-col gap-3">
                      {question.sampleTestCases.map((tc, idx) => (
                        <div key={idx} className="bg-[#0d0d0d] border border-gray-800 p-3 rounded-md text-sm font-mono">
                          <div className="text-xs text-gray-500 mb-1 font-semibold">Example {idx + 1}:</div>
                          <div className="text-gray-300 mb-1">
                            <span className="text-gray-500">Input: </span>
                            {typeof tc === 'object' ? (tc.input || tc.inputData || JSON.stringify(tc)) : tc}
                          </div>
                          {(tc.output || tc.expectedOutput) && (
                            <div className="text-gray-300 mb-1">
                              <span className="text-gray-500">Output: </span>
                              {tc.output || tc.expectedOutput}
                            </div>
                          )}
                          {tc.explanation && (
                            <div className="text-gray-400 text-xs mt-2 italic font-sans border-t border-gray-800/80 pt-1.5">
                              <span className="text-gray-500 font-semibold not-italic font-mono">Explanation: </span>
                              {tc.explanation}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {question.hints && (
                  <div className="mb-4">
                    <details className="bg-[#0d0d0d] border border-gray-800 rounded-md p-3 text-sm text-gray-400 cursor-pointer">
                      <summary className="font-semibold text-gray-300 hover:text-white">💡 Hint</summary>
                      <p className="mt-2 text-xs leading-relaxed text-gray-400">{question.hints}</p>
                    </details>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto pr-2">
                <h2 className="text-xl font-bold mb-4 text-white">Problem Statement</h2>
                <p className="mb-4 text-gray-400">No problem loaded.</p>
              </div>
            )}
          </Panel>
          
          <Separator className="w-2 cursor-col-resize hover:bg-gray-700 transition-colors mx-1 rounded flex items-center justify-center">
            <div className="h-8 w-1 bg-gray-600 rounded-full" />
          </Separator>

          {/* Right Pane: Code Editor & Custom Input */}
          <Panel defaultSize={50} minSize={20} className="flex flex-col">
            <Group orientation="vertical">
              {/* Top Right: Code Editor */}
              <Panel defaultSize={70} minSize={20} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-2 gap-2 flex-wrap">
                  <div className="flex items-center gap-3">
                    <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Code Editor</h2>
                    <div className="flex items-center gap-1.5">
                      <label className="text-xs text-gray-400 font-medium">Language:</label>
                      <select
                        value={language}
                        onChange={handleLanguageChange}
                        className="bg-[#0d0d0d] text-xs text-gray-200 border border-gray-700 rounded px-2.5 py-1 outline-none focus:border-green-500 cursor-pointer font-medium hover:border-gray-600 transition-colors"
                      >
                        <option value="CPP">CPP</option>
                        <option value="JAVA">JAVA</option>
                        <option value="PYTHON">PYTHON</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleRunCode} className="bg-gray-600 hover:bg-gray-500 text-white text-xs px-3 py-1 rounded">Run Code</button>
                    <button onClick={handleSubmit} className="bg-green-600 hover:bg-green-500 text-white text-xs px-3 py-1 rounded">Submit Answer</button>
                  </div>
                </div>
                <textarea
                  className="flex-1 bg-[#0d0d0d] rounded-md border border-gray-800 p-3 font-mono text-sm text-green-400 overflow-y-auto outline-none resize-none whitespace-pre"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Tab') {
                      e.preventDefault();
                      const start = e.target.selectionStart;
                      const end = e.target.selectionEnd;
                      const newCode = code.substring(0, start) + "    " + code.substring(end);
                      setCode(newCode);
                      setTimeout(() => {
                        e.target.selectionStart = e.target.selectionEnd = start + 4;
                      }, 0);
                    }
                  }}
                  spellCheck="false"
                />
              </Panel>

              <Separator className="h-2 cursor-row-resize hover:bg-gray-700 transition-colors my-1 rounded flex items-center justify-center">
                <div className="w-8 h-1 bg-gray-600 rounded-full" />
              </Separator>

              {/* Bottom Right: Custom Input, Test Cases & Submissions History */}
              <Panel defaultSize={30} minSize={20} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 flex flex-col overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setActiveBottomTab("testcases")}
                      className={`text-xs font-bold uppercase tracking-wider pb-0.5 border-b-2 transition-colors ${
                        activeBottomTab === "testcases"
                          ? "text-white border-green-500"
                          : "text-gray-500 border-transparent hover:text-gray-300"
                      }`}
                    >
                      Test Cases / Sample Input
                    </button>
                    <button
                      onClick={() => setActiveBottomTab("submissions")}
                      className={`text-xs font-bold uppercase tracking-wider pb-0.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                        activeBottomTab === "submissions"
                          ? "text-white border-green-500"
                          : "text-gray-500 border-transparent hover:text-gray-300"
                      }`}
                    >
                      <span>Submissions</span>
                      {submissionsHistory.length > 0 && (
                        <span className="bg-gray-800 text-gray-300 text-[10px] px-1.5 py-0.2 rounded-full border border-gray-700 font-mono font-normal">
                          {submissionsHistory.length}
                        </span>
                      )}
                    </button>
                  </div>
                  {isRunning && <span className="text-xs text-yellow-400 font-semibold animate-pulse">Running code...</span>}
                  {!isRunning && activeBottomTab === "testcases" && runResults.length > 0 && (
                    <span className="text-xs text-gray-400 font-medium">
                      Results: <span className="text-white font-bold">{runResults.filter(r => Boolean(r.passed) && !r.timedOut && String(r.actualOutput ?? "").trim() === String(r.expectedOutput ?? "").trim()).length} / {runResults.length}</span> Passed
                    </span>
                  )}
                </div>

                <div className="flex-1 bg-[#0d0d0d] rounded-md border border-gray-800 p-3 font-mono text-sm text-gray-400 overflow-y-auto">
                  {activeBottomTab === "submissions" ? (
                    submissionsHistory.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        {submissionsHistory.map((sub) => (
                          <div
                            key={sub.id}
                            onClick={() => setSelectedSubmissionModal(sub)}
                            className="bg-[#141414] hover:bg-[#1a1a1a] border border-gray-800 hover:border-gray-700 p-3 rounded-md flex justify-between items-center cursor-pointer transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                  sub.isAllPassed
                                    ? "bg-green-500/20 text-green-400 border-green-500/40"
                                    : sub.status === "Time Limit Exceeded"
                                    ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                                    : "bg-red-500/20 text-red-400 border-red-500/40"
                                }`}
                              >
                                {sub.status.toUpperCase()}
                              </span>
                              {sub.isAllPassed && (
                                <span className="text-xs font-bold px-2 py-0.5 rounded border bg-green-600/30 text-green-300 border-green-500/60 flex items-center gap-1">
                                  <span>✓</span> Submitted
                                </span>
                              )}
                              <span className="text-xs text-gray-300 font-medium">
                                Passed: <span className="font-mono font-bold text-white">{sub.passedCount} / {sub.totalCount}</span>
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                              <span className="bg-gray-800 px-2 py-0.5 rounded text-gray-300">{sub.language}</span>
                              <span>{sub.timestamp}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-gray-500 italic py-6 text-center text-xs">
                        No past submission records found yet. Submit an answer to view your submission history.
                      </div>
                    )
                  ) : (
                    question && question.sampleTestCases && question.sampleTestCases.length > 0 ? (
                      question.sampleTestCases.map((tc, idx) => {
                        const res = runResults[idx];
                        const hasResult = !!res;
                        const expectedStr = tc.output || tc.expectedOutput || res?.expectedOutput || "";
                        const actualStr = res?.actualOutput !== undefined && res?.actualOutput !== null ? String(res.actualOutput) : "";
                        const isTimedOut = hasResult && Boolean(res.timedOut);
                        const hasError = hasResult && Boolean(res.error && String(res.error).trim().length > 0);

                        // Test case is passed ONLY IF res.passed is true, not timed out, and actualoutput matches expected output
                        const isPassed = hasResult && Boolean(res.passed) && !isTimedOut && actualStr.trim() === String(expectedStr).trim();

                        return (
                          <div
                            key={idx}
                            className={`mb-3 border p-3 rounded-md transition-all duration-300 ${
                              hasResult
                                ? isPassed
                                  ? "border-green-500/60 bg-green-950/20 text-green-300 shadow-sm"
                                  : isTimedOut
                                  ? "border-amber-500/60 bg-amber-950/20 text-amber-300 shadow-sm"
                                  : "border-red-500/60 bg-red-950/20 text-red-300 shadow-sm"
                                : "border-gray-800/80 bg-[#141414] text-gray-300"
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold text-gray-400">Case {idx + 1}</span>
                              {hasResult && (
                                <span
                                  className={`text-xs font-bold px-2 py-0.5 rounded border ${
                                    isPassed
                                      ? "bg-green-500/20 text-green-400 border-green-500/40"
                                      : isTimedOut
                                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40 animate-pulse"
                                      : "bg-red-500/20 text-red-400 border-red-500/40"
                                  }`}
                                >
                                  {isPassed
                                    ? "✓ PASSED"
                                    : isTimedOut
                                    ? "⏳ TIME LIMIT EXCEEDED (TLE)"
                                    : hasError
                                    ? "⚠️ ERROR"
                                    : "✗ FAILED"}
                                </span>
                              )}
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Input: </span>
                              {typeof tc === 'object' ? (tc.input || tc.inputData || JSON.stringify(tc)) : tc}
                            </div>
                            {expectedStr !== "" && (
                              <div className="text-sm">
                                <span className="text-gray-500">Expected Output: </span>
                                {expectedStr}
                              </div>
                            )}
                            {hasResult && (
                              <div className="text-sm mt-1 pt-1 border-t border-gray-800/60">
                                <span className="text-gray-500">Actual Output: </span>
                                <span className={`font-semibold ${isPassed ? "text-green-400" : isTimedOut ? "text-amber-400" : "text-red-400"}`}>
                                  {isTimedOut ? "(Time Limit Exceeded)" : actualStr !== "" ? actualStr : "(no output)"}
                                </span>
                              </div>
                            )}
                            {isTimedOut && (
                              <div className="text-xs text-amber-300 mt-2 font-mono bg-amber-950/40 p-2 rounded border border-amber-800/60 flex items-center gap-1.5">
                                <span>⏳</span>
                                <span><strong>Time Limit Exceeded:</strong> Code execution took too long and timed out.</span>
                              </div>
                            )}
                            {hasError && (
                              <div className="text-xs text-red-300 mt-2 font-mono whitespace-pre-wrap bg-red-950/40 p-2 rounded border border-red-900/60">
                                <span className="font-bold text-red-400">⚠️ Error Details:</span>
                                <div className="mt-1 text-red-200">{res.error}</div>
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 italic">No sample test cases available.</div>
                    )
                  )}
                </div>
              </Panel>
            </Group>
          </Panel>
        </Group>
      </div>

      {/* Submission Result Pop-Up Modal */}
      {selectedSubmissionModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181818] border border-gray-700 w-full max-w-lg rounded-xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center border-b border-gray-800 pb-3">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Submission Result
                  <span className={`text-xs px-2.5 py-0.5 rounded font-bold border ${
                    selectedSubmissionModal.isAllPassed
                      ? "bg-green-500/20 text-green-400 border-green-500/40"
                      : selectedSubmissionModal.status === "Time Limit Exceeded"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-red-500/20 text-red-400 border-red-500/40"
                  }`}>
                    {selectedSubmissionModal.status.toUpperCase()}
                  </span>
                </h3>
                <p className="text-xs text-gray-400 mt-1 font-mono">
                  Submitted at {selectedSubmissionModal.timestamp} • Language: {selectedSubmissionModal.language}
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmissionModal(null)}
                className="text-gray-400 hover:text-white text-lg font-bold w-8 h-8 rounded-full hover:bg-gray-800 flex items-center justify-center transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="flex items-center justify-between bg-[#0d0d0d] p-3 rounded-lg border border-gray-800 text-sm">
              <span className="text-gray-400">Test Cases Passed:</span>
              <span className={`font-mono font-bold ${selectedSubmissionModal.isAllPassed ? "text-green-400" : "text-gray-200"}`}>
                {selectedSubmissionModal.passedCount} / {selectedSubmissionModal.totalCount}
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Test Case Summary</h4>
              {selectedSubmissionModal.results && selectedSubmissionModal.results.length > 0 ? (
                selectedSubmissionModal.results.map((res, idx) => {
                  const expectedStr = res?.expectedOutput ?? "";
                  const actualStr = res?.actualOutput !== undefined && res?.actualOutput !== null ? String(res.actualOutput) : "";
                  const isTimedOut = Boolean(res?.timedOut);
                  const hasErr = Boolean(res?.error && String(res.error).trim().length > 0);
                  const isPassed = Boolean(res?.passed) && !isTimedOut && actualStr.trim() === String(expectedStr).trim();

                  return (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border flex flex-col gap-1 transition-all ${
                        isPassed
                          ? "bg-green-950/20 border-green-500/40 text-green-300"
                          : isTimedOut
                          ? "bg-amber-950/20 border-amber-500/40 text-amber-300"
                          : "bg-red-950/20 border-red-500/40 text-red-300"
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold font-mono">Test Case {idx + 1}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${
                          isPassed
                            ? "bg-green-500/20 text-green-400 border-green-500/40"
                            : isTimedOut
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            : "bg-red-500/20 text-red-400 border-red-500/40"
                        }`}>
                          {isPassed
                            ? "✓ PASSED"
                            : isTimedOut
                            ? "⏳ TIME LIMIT EXCEEDED"
                            : hasErr
                            ? "⚠️ ERROR"
                            : "✗ WRONG ANSWER"}
                        </span>
                      </div>

                      {hasErr && (
                        <div className="text-xs text-red-300 mt-1 font-mono bg-red-950/50 p-2 rounded border border-red-900/60 whitespace-pre-wrap">
                          <span className="font-bold text-red-400">Error: </span>
                          {res.error}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-xs text-gray-500 italic">No detailed test results available.</div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-gray-800">
              <button
                onClick={() => setSelectedSubmissionModal(null)}
                className="bg-gray-800 hover:bg-gray-700 text-white text-xs px-4 py-2 rounded-md font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Battle Result Overlay */}
      {battleResult === "win" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.95) 100%)' }}>
          {/* Animated particles */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: `${Math.random() * 10 + 4}px`,
                  height: `${Math.random() * 10 + 4}px`,
                  background: ['#FFD700', '#FFA500', '#FF6347', '#00FF88', '#00BFFF', '#FF69B4'][i % 6],
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `confetti-fall ${2 + Math.random() * 3}s ease-in-out ${Math.random() * 2}s infinite`,
                  opacity: 0.8,
                  boxShadow: `0 0 ${6 + Math.random() * 10}px currentColor`
                }}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center gap-6 animate-in zoom-in duration-500">
            <div className="text-8xl" style={{ filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.6))' }}>🏆</div>
            <h1
              className="text-6xl font-black tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 30%, #FF6347 60%, #FFD700 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
                textShadow: 'none',
                filter: 'drop-shadow(0 0 20px rgba(255, 165, 0, 0.4))'
              }}
            >
              YOU WIN!
            </h1>
            <p className="text-gray-400 text-lg tracking-wide">You solved the problem before your opponent!</p>
            <button
              onClick={() => { setBattleResult(null); setCanLeave(true); }}
              className="mt-4 px-8 py-3 rounded-lg font-bold text-black text-lg transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                boxShadow: '0 4px 25px rgba(255, 165, 0, 0.4)'
              }}
            >
              Continue
            </button>
          </div>

          <style>{`
            @keyframes confetti-fall {
              0% { transform: translateY(-20vh) rotate(0deg) scale(1); opacity: 1; }
              50% { opacity: 0.8; }
              100% { transform: translateY(110vh) rotate(720deg) scale(0.3); opacity: 0; }
            }
            @keyframes gradient-shift {
              0% { background-position: 0% center; }
              50% { background-position: 200% center; }
              100% { background-position: 0% center; }
            }
          `}</style>
        </div>
      )}

      {battleResult === "lose" && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(10,0,0,0.95) 100%)' }}>
          <div className="relative flex flex-col items-center gap-6 animate-in zoom-in duration-500">
            <div className="text-8xl" style={{ filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.4))' }}>😞</div>
            <h1
              className="text-5xl font-black tracking-widest"
              style={{
                background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 50%, #991B1B 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                filter: 'drop-shadow(0 0 15px rgba(239, 68, 68, 0.3))'
              }}
            >
              YOU LOST
            </h1>
            <p className="text-gray-400 text-lg tracking-wide">Your opponent solved it first. Better luck next time!</p>
            <button
              onClick={() => { setBattleResult(null); }}
              className="mt-4 px-8 py-3 rounded-lg font-bold text-white text-lg transition-all duration-300 hover:scale-105 bg-red-600 hover:bg-red-500"
              style={{ boxShadow: '0 4px 20px rgba(239, 68, 68, 0.3)' }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default IDE;