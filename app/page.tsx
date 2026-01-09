"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import { API_ENDPOINTS } from "@/lib/config"

// Types - Backend response types
interface HitlChild {
  id: string
  score: number
  prob: number
  justificativa: string
}

interface HitlMetadata {
  node_id: string
  pergunta: string
  depth: number
  entropia_local: number
  children: HitlChild[]
}

interface ResultadoFormatado {
  classe: string
  tipo_ocorrencia: string
  justificativa_tecnica?: string
  confianca?: {
    nivel: string
    nivel_display: string
  }
  resumo_tecnico?: string
}

interface PredictResponse {
  hitl_required: boolean
  hitl_metadata?: HitlMetadata
  resultado_formatado?: ResultadoFormatado
  final?: {
    node_id: string
    log_prob: number
    historico: any[]
  }
  state: Record<string, any>
}

export default function Home() {
  // State
  const [eventoText, setEventoText] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [currentState, setCurrentState] = useState<Record<string, any> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHitlModal, setShowHitlModal] = useState(false)
  const [hitlJustification, setHitlJustification] = useState("")

  // Reset state
  const resetState = () => {
    setResult(null)
    setCurrentState(null)
    setError(null)
    setShowHitlModal(false)
    setHitlJustification("")
  }

  // Handle classification
  const handleClassificar = async () => {
    if (!eventoText.trim()) {
      setError("Por favor, insira a descrição do evento.")
      return
    }

    resetState()
    setLoading(true)

    try {
      const response = await fetch(API_ENDPOINTS.predict, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          descricao_evento: eventoText,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data: PredictResponse = await response.json()

      console.log("Backend response:", data)

      setResult(data)
      setCurrentState(data.state)

      if (data.hitl_required) {
        setShowHitlModal(true)
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erro ao classificar: ${err.message}`
          : "Erro desconhecido ao classificar evento"
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle HITL selection
  const handleHitlSelection = async (selectedChildId: string) => {
    if (!currentState) {
      setError("Estado não encontrado. Por favor, reinicie a classificação.")
      return
    }

    setShowHitlModal(false)
    setLoading(true)

    try {
      const response = await fetch(API_ENDPOINTS.hitlContinue, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          state: currentState,
          selected_child: selectedChildId,
          justification: hitlJustification || "Escolha manual do usuário",
        }),
      })

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`)
      }

      const data: PredictResponse = await response.json()

      console.log("HITL continue response:", data)

      setResult(data)
      setCurrentState(data.state)

      // Check if another HITL is required
      if (data.hitl_required) {
        setShowHitlModal(true)
        setHitlJustification("")
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? `Erro ao continuar HITL: ${err.message}`
          : "Erro desconhecido ao processar seleção HITL"
      )
    } finally {
      setLoading(false)
    }
  }

  // Get final class from node_id (fallback)
  const getFinalClass = (nodeId: string): string => {
    if (nodeId.startsWith("1.1")) return "Segurança do Trabalho"
    if (nodeId.startsWith("1.2")) return "Meio Ambiente"
    if (nodeId.startsWith("1.3")) return "Saúde Ocupacional"
    return nodeId
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-violet-50 via-purple-50 to-white p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-16 mt-8">
          <div className="flex items-center gap-3 mb-8">
            <h5 className="text-3xl font-bold">
              <span className="text-gray-900">Loopyn</span>
              <span className="text-purple-600">SMS</span>
            </h5>
          </div>
          <p className="text-xl text-gray-600 leading-relaxed max-w-4xl">
            O exemplo ilustra uma aplicação hipotética do método LATS (Language Agent Tree Search). Embora não esteja vinculado a nenhuma norma ou requisito regulatório específico, o modelo demonstra coerência lógica e consistência estrutural para apoiar a avaliação de eventos de Segurança, Meio Ambiente e Saúde (SMS).
          </p>
        </div>

        {/* Ideia Central Box */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-2xl p-10 mb-12 border border-purple-200">
          <h3 className="text-2xl font-semibold text-purple-700 mb-4">Ideia Central</h3>
          <p className="text-lg italic text-gray-700 mb-6">
            Em situações ambíguas, o exemplo demonstra que não decidir também é uma decisão válida.
          </p>
          <p className="text-base text-gray-600 leading-relaxed">
              Neste cenário hipotético, o sistema reconhece quando a informação disponível não é suficiente
              para sustentar uma conclusão responsável e, em vez de forçar uma classificação,
              sinaliza a incerteza e solicita apoio humano para avançar no raciocínio.
          </p>
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl text-gray-900">Classificar Evento SMS</CardTitle>
            <CardDescription className="text-base text-gray-600">
              Descreva o evento abaixo para análise automatizada com suporte HITL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Textarea */}
            <Textarea
              placeholder="Exemplo: Durante atividade de manutenção preventiva em equipamento elétrico..."
              value={eventoText}
              onChange={(e) => setEventoText(e.target.value)}
              className="min-h-[200px] text-base border-gray-300 focus:border-purple-500 focus:ring-purple-500"
              disabled={loading}
            />

            {/* Classify Button */}
            <Button
              onClick={handleClassificar}
              disabled={loading || !eventoText.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-6 text-lg font-medium rounded-xl shadow-lg hover:shadow-xl transition-all"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Classificando...
                </>
              ) : (
                <>
                  Classificar Evento →
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Card className="border-destructive bg-destructive/10">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div>
                      <p className="font-semibold text-destructive">Erro</p>
                      <p className="text-sm text-destructive/90">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Result Display - Clean Modern Style */}
            {result && result.final && !result.hitl_required && result.resultado_formatado && (
              <Card className="border-purple-200 bg-gradient-to-br from-white to-purple-50/30 shadow-xl">
                <CardContent className="pt-8 pb-8">
                  <div className="space-y-6">
                    {/* Title */}
                    <div className="border-b border-purple-100 pb-4">
                      <h3 className="text-2xl font-semibold text-gray-900">
                        Classificação da Ocorrência
                      </h3>
                    </div>

                    {/* Assigned Class - Main Highlight */}
                    <div className="text-center py-12 bg-white border-2 border-purple-200 rounded-xl shadow-sm">
                      <p className="text-sm text-purple-600 mb-3 uppercase tracking-widest font-medium">
                        Classe Atribuída
                      </p>
                      <p className="text-5xl font-bold text-gray-900 tracking-tight">
                        {result.resultado_formatado.classe}
                      </p>
                    </div>

                    {/* Incident Type */}
                    <div className="pt-2">
                      <p className="text-sm text-gray-600 mb-1 uppercase tracking-wide">
                        Tipo de Ocorrência
                      </p>
                      <p className="text-lg text-gray-900">
                        {result.resultado_formatado.tipo_ocorrencia}
                      </p>
                    </div>

                    {/* Technical Justification - Formal LLM Text (Expandable) */}
                    {result.resultado_formatado.justificativa_tecnica && (
                      <details className="pt-4 border-t border-purple-100">
                        <summary className="cursor-pointer text-sm text-purple-700 uppercase tracking-wide hover:text-purple-900 transition-colors select-none font-medium">
                          Justificativa Técnica
                        </summary>
                        <div className="mt-4 prose prose-sm max-w-none text-gray-700 leading-relaxed">
                          {result.resultado_formatado.justificativa_tecnica.split('\n\n').map((paragrafo: string, index: number) => (
                            <p key={index} className="mb-4">
                              {paragrafo}
                            </p>
                          ))}
                        </div>
                      </details>
                    )}

                    {/* Confidence Level - Discreet */}
                    {result.resultado_formatado.confianca && (
                      <div className="pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500 uppercase tracking-wide">
                          Nível de Confiança da Análise
                        </p>
                        <p className={`text-sm mt-1 ${
                          result.resultado_formatado.confianca.nivel === 'alta'
                            ? 'text-green-700'
                            : result.resultado_formatado.confianca.nivel === 'moderada'
                            ? 'text-yellow-700'
                            : 'text-orange-700'
                        }`}>
                          {result.resultado_formatado.confianca.nivel_display}
                        </p>
                      </div>
                    )}

                    {/* Technical Details (Expandable Discreet) */}
                    {result.resultado_formatado.resumo_tecnico && (
                      <details className="pt-4 border-t border-gray-100">
                        <summary className="cursor-pointer text-xs text-gray-500 uppercase tracking-wide hover:text-gray-700 transition-colors select-none">
                          Detalhes Técnicos da Análise
                        </summary>
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div
                            className="prose prose-xs max-w-none text-gray-600 text-sm"
                            dangerouslySetInnerHTML={{
                              __html: result.resultado_formatado.resumo_tecnico
                                .replace(/\n/g, '<br/>')
                                .replace(/##\s+(.+)/g, '<h4 class="text-sm font-semibold text-gray-800 mt-3 mb-1">$1</h4>')
                                .replace(/###\s+(.+)/g, '<h5 class="text-xs font-semibold text-gray-700 mt-2 mb-1">$1</h5>')
                                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                                .replace(/^- (.+)/gm, '<li class="ml-4 text-xs">$1</li>')
                                .replace(/^(\d+)\. (.+)/gm, '<div class="mb-1 text-xs">$1. $2</div>')
                            }}
                          />
                        </div>
                      </details>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Fallback: Old format */}
            {result && result.final && !result.hitl_required && !result.resultado_formatado && (
              <Card className="border-green-500 bg-green-50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-green-900 mb-3">
                        🔎 Resultado Sugerido pelo Sistema
                      </p>
                      <div className="mt-2 space-y-3">
                        <div className="bg-white border border-green-200 rounded-lg p-3">
                          <span className="text-sm font-medium text-gray-700">
                            Classe:
                          </span>
                          <span className="ml-2 text-lg font-bold text-green-800">
                            {getFinalClass(result.final.node_id)}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600">
                          <span className="font-medium">Nó Final:</span> {result.final.node_id}
                          <span className="mx-2">•</span>
                          <span className="font-medium">Decisões:</span> {result.final.historico.length}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>

        {/* HITL Modal */}
        <Dialog open={showHitlModal} onOpenChange={setShowHitlModal}>
          <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col overflow-hidden">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>🔥 Revisão Humana Necessária (HITL)</DialogTitle>
              <DialogDescription>
                O sistema detectou alta incerteza nesta decisão. Por favor,
                selecione o caminho mais apropriado:
              </DialogDescription>
            </DialogHeader>

            {result?.hitl_metadata && (
              <div className="space-y-4 overflow-y-auto flex-1 pr-2 min-h-0">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-amber-900 mb-2">
                    📍 Nó Atual: {result.hitl_metadata.node_id}
                  </p>
                  <p className="text-sm text-amber-800 mb-1">
                    ❓ {result.hitl_metadata.pergunta}
                  </p>
                  <div className="flex gap-4 text-xs text-amber-700 mt-2">
                    <span>Profundidade: {result.hitl_metadata.depth}</span>
                    <span>Entropia: {result.hitl_metadata.entropia_local.toFixed(3)}</span>
                  </div>
                </div>

                {/* Justification Input */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Justificativa da Escolha (opcional):
                  </label>
                  <Textarea
                    placeholder="Deixe em branco para usar a justificativa do modelo automaticamente..."
                    value={hitlJustification}
                    onChange={(e) => setHitlJustification(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    💡 Se vazio, será usada a justificativa sugerida pelo modelo
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Opções Disponíveis (ordenadas por relevância):
                  </p>
                  {result.hitl_metadata.children.map((child, index) => {
                    const probPercent = (child.prob * 100);
                    const probLabel = probPercent >= 50 ? "Alta" :
                                     probPercent >= 25 ? "Média" : "Baixa";
                    const probColor = probPercent >= 50 ? "text-green-600" :
                                     probPercent >= 25 ? "text-yellow-600" : "text-orange-600";

                    return (
                      <Card
                        key={child.id}
                        className={`cursor-pointer hover:border-blue-500 transition-colors ${
                          index === 0 ? 'border-blue-400 border-2' : ''
                        }`}
                        onClick={() => handleHitlSelection(child.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <p className="font-medium text-gray-900 flex items-center gap-2">
                                {child.id}
                                {index === 0 && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">Recomendada</span>}
                              </p>
                              <p className="text-sm text-gray-600 mt-1">
                                {child.justificativa}
                              </p>
                            </div>
                            <div className="text-right ml-4">
                              <p className={`text-sm font-semibold ${probColor}`}>
                                Probabilidade {probLabel}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {probPercent.toFixed(1)}%
                              </p>
                            </div>
                          </div>
                          <Button
                            variant={index === 0 ? "default" : "outline"}
                            className="w-full mt-2"
                            size="sm"
                          >
                            Selecionar esta opção
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-500">
            Powered by LoopynLab| Exemplo aplicado de LoopynLATS
          </p>
        </div>
      </div>
    </main>
  )
}
