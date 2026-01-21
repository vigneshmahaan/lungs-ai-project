import Link from "next/link";
import { ArrowRight, ShieldCheck, Zap, BarChart3, Cpu, Stethoscope, TrendingUp, Lock, HeartPlus } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-sky-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-blue-700 shadow-lg">
              <HeartPlus className="h-7 w-7 text-white" />
            </div>
            <div className="leading-tight">
              <div className="text-base font-bold text-slate-900">Respiratory AI</div>
              <div className="text-xs font-medium text-slate-500">Lung Sound Analysis</div>
            </div>
          </div>
          <div className="hidden items-center gap-2 rounded-full border border-sky-200 bg-sky-50/50 px-4 py-2 text-xs font-medium text-sky-700 shadow-sm backdrop-blur sm:flex">
            <ShieldCheck className="h-4 w-4" />
            Software-only • No sensors required
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50/50 px-4 py-2 text-xs font-semibold text-sky-700 backdrop-blur">
              <Zap className="h-3.5 w-3.5" />
              ML-Based Respiratory Disease Classification
            </div>

            <div className="space-y-4">
              <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl">
                Analyze respiratory diseases from sound.
              </h1>
              <p className="text-lg leading-8 text-slate-600">
                Upload a WAV lung sound recording. Our advanced AI analyzes cough and breathing patterns to predict respiratory conditions with high accuracy.
              </p>
            </div>

            {/* Features Grid */}
           

            {/* CTA Buttons */}
            <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center">
              <Link
                href="/upload"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 px-6 py-3.5 font-semibold text-white shadow-lg transition hover:shadow-xl hover:from-sky-700 hover:to-blue-700 sm:px-8"
              >
                Start Analysis <ArrowRight className="h-5 w-5" />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white/50 px-6 py-3.5 font-semibold text-slate-900 backdrop-blur transition hover:bg-white"
              >
                Learn More
              </a>
            </div>
          </div>

          {/* Right Preview Card */}
          <div className="space-y-4">
            <div className="rounded-3xl border border-white/20 bg-white/80 p-8 shadow-2xl backdrop-blur lg:p-10">
              <div className="space-y-6">
                <div>
                  <div className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Analysis Preview</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900">What you'll get</div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Prediction Card */}
                  <div className="group rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 to-blue-50 p-5 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-sky-600 uppercase">Prediction</div>
                        <div className="mt-3 text-2xl font-bold text-slate-900">Pneumonia</div>
                      </div>
                      <div className="rounded-lg bg-sky-100 p-3 text-sky-600">
                        <Stethoscope className="h-6 w-6" />
                      </div>
                    </div>
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-600">
                        <span>Confidence</span>
                        <span className="font-semibold text-slate-900">89%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-slate-200">
                        <div className="h-2 rounded-full bg-gradient-to-r from-sky-500 to-blue-600" style={{ width: "89%" }} />
                      </div>
                    </div>
                  </div>

                  {/* Probabilities Card */}
                  <div className="rounded-2xl border border-slate-100 bg-white/50 p-5 backdrop-blur">
                    <div className="text-xs font-semibold text-slate-600 uppercase">Probabilities</div>
                    <div className="mt-4 space-y-3">
                      {[
                        { name: "Pneumonia", val: 89 },
                        { name: "COPD", val: 6 },
                        { name: "Normal", val: 3 },
                      ].map((item) => (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between text-xs font-medium text-slate-600">
                            <span>{item.name}</span>
                            <span className="font-semibold text-slate-900">{item.val}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200">
                            <div
                              className="h-1.5 rounded-full bg-sky-500"
                              style={{ width: `${item.val}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
                  <div className="text-xs font-semibold text-blue-700">+ Waveform & Mel-Spectrogram Visualizations</div>
                  <div className="mt-2 text-xs text-blue-600">Full audio analysis with detailed charts</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="how-it-works" className="border-t border-slate-200 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="text-sm font-semibold text-sky-600 uppercase tracking-wide">How It Works</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Advanced AI Analysis Pipeline</h2>
            <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
              Our system processes audio through multiple stages of sophisticated analysis
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                num: "01",
                title: "Audio Processing",
                desc: "Resample, denoise, normalize audio to 16kHz for optimal analysis",
                icon: Zap,
              },
              {
                num: "02",
                title: "Feature Extraction",
                desc: "Extract MFCC & Mel-spectrogram features for pattern recognition",
                icon: BarChart3,
              },
              {
                num: "03",
                title: "AI Prediction",
                desc: "CNN model predicts disease with confidence and probabilities",
                icon: TrendingUp,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.num}
                  className="group rounded-2xl border border-slate-200 bg-white p-8 hover:shadow-lg hover:border-sky-200 transition"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-blue-600">
                      {item.num}
                    </div>
                    <div className="rounded-lg bg-sky-100 p-3 text-sky-600 group-hover:bg-sky-600 group-hover:text-white transition">
                      <Icon className="h-6 w-6" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Diseases Section */}
      <section className="border-t border-slate-200 bg-gradient-to-br from-sky-50 to-blue-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="text-sm font-semibold text-sky-600 uppercase tracking-wide">Supported Conditions</div>
            <h2 className="mt-3 text-3xl font-bold text-slate-900 sm:text-4xl">Respiratory Diseases We Detect</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { name: "Normal", color: "green" },
              { name: "Asthma", color: "yellow" },
              { name: "Pneumonia", color: "red" },
              { name: "Bronchitis", color: "orange" },
              { name: "COPD", color: "purple" },
            ].map((disease) => {
              const colorMap: Record<string, { bg: string; border: string; text: string }> = {
                green: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
                yellow: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
                red: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
                orange: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
                purple: { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
              };
              const colors = colorMap[disease.color];

              return (
                <div
                  key={disease.name}
                  className={`rounded-2xl border ${colors.border} ${colors.bg} p-6 text-center hover:shadow-lg transition`}
                >
                  <div className={`text-xl font-bold ${colors.text}`}>{disease.name}</div>
                  <div className="mt-2 text-xs text-slate-600">AI Detection</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-t border-slate-200 bg-white py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Lock,
                title: "Secure & Private",
                desc: "All processing happens locally. No audio data stored on servers.",
              },
              {
                icon: Cpu,
                title: "Lightning Fast",
                desc: "Get results in seconds with our optimized deep learning model.",
              },
              {
                icon: ShieldCheck,
                title: "Medical Grade",
                desc: "Built with healthcare standards and clinical accuracy in mind.",
              },
            ].map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div key={benefit.title} className="rounded-2xl border border-slate-200 bg-white p-8">
                  <div className="rounded-lg bg-sky-100 p-3 w-fit text-sky-600 mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{benefit.title}</h3>
                  <p className="text-slate-600">{benefit.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-slate-200 bg-gradient-to-r from-sky-600 to-blue-600 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white sm:text-4xl">Ready to analyze?</h2>
          <p className="mt-4 text-lg text-sky-100">Upload your lung sound recording and get instant AI-powered diagnosis insights.</p>
          <div className="mt-8">
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 font-semibold text-sky-600 shadow-lg transition hover:bg-sky-50"
            >
              Start Analyzing <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-50/50 py-8 sm:py-12">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-sm text-slate-600">
            Respiratory AI © 2026 • Advanced ML-based respiratory disease classification
          </p>
          <p className="mt-2 text-xs text-slate-500">
            This tool is for informational purposes only. Always consult healthcare professionals for diagnosis.
          </p>
        </div>
      </footer>
    </div>
  );
}
