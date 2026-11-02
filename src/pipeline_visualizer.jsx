import React, { useState } from 'react';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Bot, 
  Terminal, 
  ShieldCheck, 
  RotateCcw,
  Activity
} from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 1, name: 'Checkout Code', command: 'git checkout main' },
  { id: 2, name: 'Environment Setup', command: 'actions/setup-node@v3 (v18.x)' },
  { id: 3, name: 'Install Dependencies', command: 'npm ci' },
  { id: 4, name: 'Unit Tests (Jest)', command: 'npm test -- --coverage' },
  { id: 5, name: 'Code Coverage Report', command: 'lcov-report generation' },
  { id: 6, name: 'SonarCloud Quality Gate', command: 'sonar-scanner analysis' }
];

function getStatusBadgeStyle(status) {
  if (status === 'success') {
    return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
  }
  if (status === 'failed') {
    return 'bg-red-950 text-red-400 border border-red-800';
  }
  if (status === 'running') {
    return 'bg-blue-950 text-blue-400 border border-blue-800 animate-pulse';
  }
  return 'bg-slate-800 text-slate-400';
}

function getStepCardStyle(isFailed, isPassed, isActive) {
  if (isFailed) {
    return 'bg-red-950/40 border-red-700 text-red-200';
  }
  if (isPassed) {
    return 'bg-emerald-950/30 border-emerald-800/80 text-emerald-200';
  }
  if (isActive) {
    return 'bg-blue-950/50 border-blue-500 text-blue-100 shadow-md ring-1 ring-blue-500';
  }
  return 'bg-slate-950/50 border-slate-800/60 text-slate-400';
}

function getLogTextStyle(logText) {
  if (logText.includes('ERROR') || logText.includes('FAILED')) {
    return 'text-red-400';
  }
  if (logText.includes('✓') || logText.includes('PASSED')) {
    return 'text-emerald-400';
  }
  return 'text-slate-300';
}

export default function PipelineVisualizer() {
  const [scenario, setScenario] = useState('success');
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [status, setStatus] = useState('idle');
  const [logs, setLogs] = useState([]);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const addLog = (msg) => {
    const timestamp = new Date().toLocaleTimeString();
    const logItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      text: `[${timestamp}] ${msg}`
    };
    setLogs((prev) => [...prev, logItem]);
  };

  const runPipeline = async () => {
    setIsRunning(true);
    setStatus('running');
    setCurrentStep(0);
    setLogs([]);
    setAiAnalysis(null);

    addLog('🚀 Iniciando workflow de Integración Continua (CI)...');

    for (let i = 0; i < PIPELINE_STEPS.length; i++) {
      const step = PIPELINE_STEPS[i];
      setCurrentStep(i + 1);
      addLog(`Ejecutando Paso ${step.id}: ${step.name} ($ ${step.command})...`);

      await new Promise((resolve) => setTimeout(resolve, 800));

      if (scenario === 'test_fail' && step.id === 4) {
        addLog('❌ ERROR: FAIL tests/taller.test.js');
        addLog('   TypeError: app.address is not a function');
        setStatus('failed');
        setIsRunning(false);
        setAiAnalysis({
          title: 'Diagnóstico de Falla en Pruebas',
          cause: 'Falta la exportación del módulo Express en src/app.js.',
          fix: 'Agregar module.exports = app; al final del archivo src/app.js.'
        });
        return;
      }

      if (scenario === 'sonar_fail' && step.id === 6) {
        addLog('⚠️ SonarCloud Analysis completed.');
        addLog('❌ Quality Gate Status: FAILED');
        addLog('   - Cobertura de código: 68.4% (Requerido: >80%)');
        addLog('   - Code Smells detectados: 4 (S1481, S1854, S7772)');
        setStatus('failed');
        setIsRunning(false);
        setAiAnalysis({
          title: 'Diagnóstico de Quality Gate',
          cause: 'La cobertura (68.4%) no alcanza el umbral mínimo exigido (80%) y existen Code Smells activos.',
          fix: 'Corregir variables sin uso en src/app.js y actualizar importación de node:crypto.'
        });
        return;
      }

      addLog(`✓ Paso ${step.id} completado con éxito.`);
    }

    addLog('📊 Generando métricas de cobertura...');
    addLog('✅ Cobertura calculada: 85.2% (Pasa umbral de 80%)');
    addLog('🟢 Quality Gate: PASSED (0 Bugs, 0 Vulnerabilidades, 0 Code Smells)');
    setStatus('success');
    setIsRunning(false);
  };

  const applyAutoFix = () => {
    setScenario('success');
    setAiAnalysis(null);
    addLog('🔧 Aplicando Auto-Fix sugerido por el Agente IA...');
    setTimeout(() => {
      addLog('✅ Corrección aplicada correctamente en el código.');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      <header className="max-w-6xl mx-auto mb-8 bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row justify-between items-center shadow-lg">
        <div>
          <span className="text-xs font-semibold bg-blue-900/60 text-blue-300 border border-blue-700/50 px-3 py-1 rounded-full">
            #SOY UT SAN JUAN — UTSJR
          </span>
          <h1 className="text-2xl font-bold mt-2 text-white">
            Lumix Auto Studio — Agente CI/CD
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Gestión del Proceso de Desarrollo de Software | Alumna: Nancy María Moreno Sixto
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <button
            type="button"
            onClick={runPipeline}
            disabled={isRunning}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md"
          >
            {isRunning ? <RefreshCw className="animate-spin w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Ejecutando...' : 'Iniciar Pipeline CI'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4 text-blue-400" /> Selección de Escenario
          </h2>
          <div className="space-y-3">
            {[
              { id: 'success', label: '1. Ejecución Exitosa (Normal)', desc: '100% Tests pasados + Quality Gate Passed' },
              { id: 'test_fail', label: '2. Fallo en Pruebas Unitarias', desc: 'Falta module.exports en app.js' },
              { id: 'sonar_fail', label: '3. Fallo en Quality Gate', desc: 'Cobertura < 80% y Code Smells' }
            ].map((sc) => {
              const isSelected = scenario === sc.id;
              const scStyle = isSelected
                ? 'bg-blue-950/60 border-blue-500 text-blue-200'
                : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:bg-slate-800/50';

              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setScenario(sc.id)}
                  disabled={isRunning}
                  className={`w-full text-left p-3 rounded-lg border transition ${scStyle}`}
                >
                  <div className="font-medium text-sm">{sc.label}</div>
                  <div className="text-xs opacity-70 mt-1">{sc.desc}</div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 pt-5 border-t border-slate-800">
            <h3 className="text-xs font-semibold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Estándar ISO/IEC 25010
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block">Cobertura Meta</span>
                <span className="text-emerald-400 font-bold text-sm">&gt; 80.0%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded border border-slate-800">
                <span className="text-slate-400 block">Code Smells</span>
                <span className="text-emerald-400 font-bold text-sm">0 Objetivo</span>
              </div>
            </div>
          </div>
        </section>

        <section className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" /> Pasos de Integración Continua
              </h2>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${getStatusBadgeStyle(status)}`}>
                Estado: {status.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PIPELINE_STEPS.map((step) => {
                const isActive = currentStep === step.id && isRunning;
                const isPassed = currentStep > step.id || (status === 'success' && currentStep === 6);
                const isFailed = status === 'failed' && currentStep === step.id;

                return (
                  <div
                    key={step.id}
                    className={`p-3.5 rounded-lg border transition-all ${getStepCardStyle(isFailed, isPassed, isActive)}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-500">PASO 0{step.id}</span>
                      {isPassed && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                      {isFailed && <XCircle className="w-4 h-4 text-red-400" />}
                      {isActive && <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />}
                    </div>
                    <div className="font-semibold text-sm mt-1">{step.name}</div>
                    <div className="text-xs font-mono opacity-60 mt-1 truncate">{step.command}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {aiAnalysis && (
            <div className="bg-amber-950/30 border border-amber-800/60 rounded-xl p-5 text-amber-200 shadow-lg">
              <div className="flex items-center gap-2 mb-2 text-amber-400 font-bold">
                <Bot className="w-5 h-5" /> {aiAnalysis.title}
              </div>
              <p className="text-xs mb-3 text-amber-200/80"><strong className="text-amber-300">Causa Raíz:</strong> {aiAnalysis.cause}</p>
              <div className="bg-slate-950/80 border border-amber-900/50 p-3 rounded text-xs font-mono mb-4 text-amber-100">
                💡 Sugerencia de Solución: {aiAnalysis.fix}
              </div>
              <button
                type="button"
                onClick={applyAutoFix}
                className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-slate-950 font-semibold px-4 py-2 rounded text-xs transition"
              >
                <RotateCcw className="w-4 h-4" /> Aplicar Corrección Automática (Auto-Fix)
              </button>
            </div>
          )}

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs">
            <div className="text-slate-400 mb-2 flex items-center justify-between pb-2 border-b border-slate-800">
              <span>Output Console / Terminal Logs</span>
              <span className="text-slate-600">{logs.length} líneas</span>
            </div>
            <div className="h-36 overflow-y-auto space-y-1 text-slate-300">
              {logs.length === 0 ? (
                <span className="text-slate-600 italic">Haz clic en "Iniciar Pipeline CI" para comenzar la simulación...</span>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className={getLogTextStyle(log.text)}>
                    {log.text}
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}