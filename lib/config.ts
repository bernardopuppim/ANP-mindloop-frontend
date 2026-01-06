/**
 * Configuração central da aplicação
 *
 * Este arquivo centraliza todas as configurações do frontend,
 * especialmente a URL da API backend.
 */

/**
 * URL base da API backend
 *
 * Ordem de precedência:
 * 1. NEXT_PUBLIC_API_URL (variável de ambiente)
 * 2. http://localhost:8000 (desenvolvimento local)
 *
 * Para produção, configure NEXT_PUBLIC_API_URL no Vercel
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**
 * Configuração de endpoints da API
 */
export const API_ENDPOINTS = {
  predict: `${API_BASE_URL}/predict`,
  hitlContinue: `${API_BASE_URL}/hitl/continue`,
  health: `${API_BASE_URL}/`,
} as const;

/**
 * Configuração de timeouts (em milissegundos)
 */
export const TIMEOUTS = {
  predict: 60000, // 60 segundos para classificação
  hitl: 60000, // 60 segundos para continuar após HITL
} as const;
