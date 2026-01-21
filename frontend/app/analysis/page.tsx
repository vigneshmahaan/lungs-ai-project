"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Download, TriangleAlert, ArrowRight, CheckCircle2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { MelSpectrogram } from "@/components/visual/MelSpectrogram";
import { ProbabilityChart } from "@/components/visual/ProbabilityChart";
import { WaveformChart } from "@/components/visual/WaveformChart";
import type { PredictResponse } from "@/lib/api";

function pretty(n: number) {
  return Number.isFinite(n) ? n.toFixed(2) : "0.00";
}

export default function AnalysisPage() {
  const [result] = useState<PredictResponse | null>(() => {
    try {
      const raw = sessionStorage.getItem("resp-ai:lastResult");
      if (!raw) return null;
      return JSON.parse(raw) as PredictResponse;
    } catch {
      return null;
    }
  });
  const [error] = useState<string | null>(() => {
    try {
      const raw = sessionStorage.getItem("resp-ai:lastResult");
      if (!raw) return "No analysis found. Please upload an audio file first.";
      JSON.parse(raw);
      return null;
    } catch {
      return "Failed to load analysis result.";
    }
  });
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement | null>(null);

  const sortedProbs = useMemo(() => {
    if (!result) return [];
    return Object.entries(result.probabilities).sort((a, b) => b[1] - a[1]);
  }, [result]);

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-3xl border border-red-200 bg-white p-8 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-red-100 p-4">
                <TriangleAlert className="h-8 w-8 text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Analysis not available</h2>
                <p className="mt-1 text-slate-600">{error}</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/upload">
                <Button className="rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3 font-semibold text-white hover:from-sky-700 hover:to-blue-700">
                  Go to Upload <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const top = sortedProbs[0]?.[0] ?? result.predicted_disease;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-sky-600 uppercase tracking-wide">Step 2 of 2</div>
              <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">Analysis Results</h1>
              <p className="mt-2 text-base text-slate-600">Your respiratory analysis is complete</p>
            </div>
            <Link href="/upload" className="hidden text-sm font-semibold text-sky-600 hover:text-sky-700 transition sm:block">
              Analyze Another ↻
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div ref={reportRef} className="space-y-8">
          {/* Primary Result Card */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-3xl border border-white/20 bg-gradient-to-br from-white to-blue-50/50 p-8 shadow-2xl backdrop-blur lg:p-10"
          >
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Left: Prediction */}
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Predicted Disease</p>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mt-4 flex items-center gap-4"
                  >
                    <div className="rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 p-5">
                      <CheckCircle2 className="h-10 w-10 text-sky-600" />
                    </div>
                    <div>
                      <h2 className="text-4xl font-bold text-slate-900 sm:text-5xl">{result.predicted_disease}</h2>
                      <Badge className="mt-3 rounded-full bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700">
                        Top Prediction
                      </Badge>
                    </div>
                  </motion.div>
                </div>

                {/* Confidence */}
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-900">Confidence Score</p>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="space-y-3"
                  >
                    <div className="flex items-end gap-4">
                      <div className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">
                        {pretty(result.confidence)}%
                      </div>
                      <div className="flex-1 h-3 rounded-full bg-slate-200 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.confidence}%` }}
                          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                          className="h-full bg-gradient-to-r from-sky-500 to-blue-600 rounded-full"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-slate-600">Model confidence in this prediction</p>
                  </motion.div>
                </div>
              </div>

              {/* Right: Probability Chart */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900">Class Probabilities</p>
                <div className="rounded-2xl border border-slate-200 bg-white/50 p-6 backdrop-blur">
                  <ProbabilityChart probabilities={result.probabilities} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Visualizations Grid */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Waveform */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
            >
              <div className="space-y-1 mb-6">
                <p className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Waveform</p>
                <p className="text-xs text-slate-600">Audio amplitude trace visualization</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <WaveformChart waveform={result.visualizations.waveform} />
              </div>
            </motion.div>

            {/* Mel-Spectrogram */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
            >
              <MelSpectrogram mel={result.visualizations.mel_spectrogram} />
            </motion.div>
          </div>

          {/* Summary Report */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg"
          >
            <p className="text-sm font-semibold text-slate-900 uppercase tracking-wide mb-6">Report Summary</p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Primary Result */}
              <div className="rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5">
                <p className="text-xs font-semibold text-sky-700 uppercase">Primary Result</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{result.predicted_disease}</p>
                <p className="mt-2 text-xs text-sky-600 font-medium">Top prediction</p>
              </div>

              {/* Confidence */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <p className="text-xs font-semibold text-slate-600 uppercase">Confidence</p>
                <p className="mt-3 text-2xl font-bold text-slate-900">{pretty(result.confidence)}%</p>
                <p className="mt-2 text-xs text-slate-600">Model certainty</p>
              </div>

              {/* Second Best */}
              {sortedProbs[1] && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-600 uppercase">2nd Likely</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{sortedProbs[1][0]}</p>
                  <p className="mt-2 text-xs text-slate-600">{pretty(sortedProbs[1][1])}%</p>
                </div>
              )}

              {/* Third Best */}
              {sortedProbs[2] && (
                <div className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-600 uppercase">3rd Likely</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">{sortedProbs[2][0]}</p>
                  <p className="mt-2 text-xs text-slate-600">{pretty(sortedProbs[2][1])}%</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="mt-8 flex flex-col gap-3 border-t border-slate-200 pt-8 sm:flex-row">
              <Link href="/upload" className="flex-1">
                <Button className="w-full rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3 font-semibold text-white hover:from-sky-700 hover:to-blue-700">
                  Analyze Another <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
             
            </div>

            {/* Download Error */}
          
          </motion.div>

          {/* Disclaimer */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-6">
            <p className="text-sm text-amber-900 font-medium">⚕️ Disclaimer</p>
            <p className="mt-2 text-xs text-amber-800">
              This analysis is for informational purposes only. Always consult with a qualified healthcare professional for medical diagnosis and treatment decisions.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
