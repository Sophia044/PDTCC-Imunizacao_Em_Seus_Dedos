// ============================================================
// BARREL EXPORT: Componentes de Autenticação
// DESCRIÇÃO: Exporta todos os componentes reutilizáveis do
//            módulo de autenticação em um único ponto de entrada.
//            Facilita a importação e evita imports relativos longos.
//
// USO:
//   import { AuthSegmentSelector, AuthContextMessage } from '../../components/auth';
//
// ============================================================

export { AuthSegmentSelector } from './AuthSegmentSelector';
export type { SegmentOption } from './AuthSegmentSelector';
export { AuthContextMessage } from './AuthContextMessage';
