"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FileAudio, Loader2, UploadCloud, ArrowRight, Check } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { predictLungSound, type PredictResponse } from "@/lib/api";

export default function UploadPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = useMemo(() => !!file && !loading, [file, loading]);

  function onPick(f: File | null) {
    setError(null);
    setFile(f);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(f ? URL.createObjectURL(f) : null);
  }

  function validate(f: File): string | null {
    const ext = f.name.toLowerCase().split(".").pop();
    if (!ext || (ext !== "wav" && ext !== "mp3")) return "Please upload a WAV or MP3 file.";
    if (f.size > 25 * 1024 * 1024) return "File too large (max 25MB).";
    return null;
  }

  async function analyze() {
    if (!file) return;
    const v = validate(file);
    if (v) {
      setError(v);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result: PredictResponse = await predictLungSound(file);
      sessionStorage.setItem("resp-ai:lastResult", JSON.stringify(result));
      window.location.href = "/analysis";
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-sky-600 uppercase tracking-wide">Step 1 of 2</div>
              <h1 className="mt-1 text-3xl font-bold text-slate-900 sm:text-4xl">Upload lung sound audio</h1>
              <p className="mt-2 text-base text-slate-600">Drag-and-drop a WAV breath recording for analysis.</p>
            </div>
            <Link href="/" className="hidden text-sm font-semibold text-sky-600 hover:text-sky-700 transition sm:block">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="grid gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Upload Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="group relative rounded-3xl border-2 border-dashed border-sky-200 bg-gradient-to-br from-sky-50/50 to-blue-50/50 p-8 sm:p-12 transition hover:border-sky-300 hover:bg-sky-50/70"
              onClick={() => inputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const f = e.dataTransfer.files?.[0];
                if (!f) return;
                const v = validate(f);
                if (v) return setError(v);
                onPick(f);
              }}
            >
              {file ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-2xl bg-green-100 p-4 mb-4">
                    <Check className="h-8 w-8 text-green-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">File selected</p>
                  <p className="mt-2 text-sm text-slate-600">{file.name}</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="rounded-2xl bg-sky-100 p-4 mb-4"
                  >
                    <UploadCloud className="h-8 w-8 text-sky-600" />
                  </motion.div>
                  <h3 className="text-xl font-semibold text-slate-900">Drop your audio here</h3>
                  <p className="mt-2 text-slate-600">or click to browse</p>
                  <p className="mt-1 text-xs text-slate-500">WAV • Max 20MB</p>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept="audio/wav,audio/x-wav,audio/mpeg,audio/mp3,.wav,.mp3"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0] ?? null;
                  if (!f) return onPick(null);
                  const v = validate(f);
                  if (v) return setError(v);
                  onPick(f);
                }}
              />
            </motion.div>

            {/* File Details */}
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="rounded-xl bg-sky-100 p-3">
                      <FileAudio className="h-6 w-6 text-sky-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{file.name}</p>
                      <p className="text-sm text-slate-600">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="rounded-lg hover:bg-red-50 hover:text-red-600"
                    onClick={() => onPick(null)}
                  >
                    Remove
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-6"
              >
                <Alert variant="destructive" className="rounded-2xl border-red-200 bg-red-50">
                  <AlertTitle className="text-red-900">Upload error</AlertTitle>
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Analyze Button */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                className="flex-1 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-sky-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!canAnalyze}
                onClick={analyze}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Analyzing…
                  </>
                ) : (
                  <>
                    Analyze Audio <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
              <Link href="/" className="sm:hidden">
                <Button variant="outline" className="w-full rounded-xl">
                  Cancel
                </Button>
              </Link>
            </div>
          </div>

          {/* Sidebar - Preview & Pipeline */}
          <div className="space-y-6">
            {/* Audio Preview Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Audio Preview</h3>
              <p className="mt-1 text-xs text-slate-600">Confirm before analysis</p>

              <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                {audioUrl ? (
                  <audio
                    controls
                    src={audioUrl}
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-sm text-slate-500">No audio selected</p>
                  </div>
                )}
              </div>
            </div>

            {/* Pipeline Info Card */}
          

            {/* Info Card */}
            <div className="rounded-2xl border border-blue-200 bg-blue-50/50 p-6">
              <h3 className="text-sm font-semibold text-blue-900">💡 Pro Tip</h3>
              <p className="mt-2 text-sm text-blue-800">
                Use clear, high-quality audio recordings for the best accuracy.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
