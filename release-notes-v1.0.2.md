# Release v1.0.2 (draft)

**Date:** 2026-01-28

## Highlights
- Lightweight published package ready for the community; documentation and runnable examples are available in the repository.

## Changes
- chore(package): remove `examples` from published `files` to reduce tarball.
- chore(package): add `sideEffects: false` to improve tree-shaking.
- feat(pack): add `prepack`/`postpack` scripts (`scripts/prepack.js`, `scripts/postpack.js`) to temporarily hide sourcemaps during pack/publish.
- docs: update `README.md` (bundle size badge + "Run examples locally" instructions).
- bump version to `1.0.2`.

## Why
Keep published package minimal for consumers while preserving runnable examples in the repo for contributors and evaluators.

## Notes for consumers
Package includes `dist/` (ESM/CJS + `.d.ts`), docs and LICENSE; sourcemaps are NOT included in the published tarball.

## How to verify
- `npm view logmind version`
- `npm install logmind@1.0.2`
- `npm pack --dry-run` (locally)

---

Release prepared by the maintainers. See repository for full examples and changelog.

---

## Versão em Português (rascunho)

**Data:** 2026-01-28

### Destaques
- Pacote publicado mais leve e pronto para a comunidade; documentação e exemplos disponíveis no repositório.

### Alterações
- chore(package): remover `examples` dos arquivos publicados para reduzir o tarball.
- chore(package): adicionar `sideEffects: false` para melhorar tree-shaking.
- feat(pack): adicionar scripts `prepack`/`postpack` (`scripts/prepack.js`, `scripts/postpack.js`) para ocultar temporariamente sourcemaps durante o pack/publish.
- docs: atualizar `README.md` (badge de tamanho do bundle + instruções "Run examples locally").
- bump da versão para `1.0.2`.

### Por quê
Manter o pacote publicado minimalista para consumidores enquanto preserva exemplos executáveis no repositório para contribuintes e avaliadores.

### Observações para consumidores
O pacote publicado inclui `dist/` (ESM/CJS + `.d.ts`), documentação e LICENSE; os sourcemaps NÃO estão incluídos no tarball publicado.

### Como verificar
- `npm view logmind version`
- `npm install logmind@1.0.2`
- `npm pack --dry-run` (localmente)

---

Rascunho das release notes preparado pelos mantenedores. Veja o repositório para exemplos completos e o changelog.
