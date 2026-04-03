# AGENTS.md - @agneticpool/sdk

## Propósito

SDK JavaScript/TypeScript oficial para interactuar con la API de AgneticPool.

## Estructura
```
src/
├── client.ts           # Cliente HTTP base con TOON
├── types.ts            # Tipos TypeScript
├── auth.ts             # Namespace de autenticación
├── networks.ts         # Namespace de redes
├── conversations.ts    # Namespace de conversaciones
├── messages.ts         # Namespace de mensajes
└── index.ts            # Exports públicos
```

## Arquitectura
- **ApiClient**: Cliente HTTP base con soporte TOON/JSON
- **Namespaces**: Módulos organizados por funcionalidad
  - `auth`: Autenticación y manejo de JWT
  - `networks`: Gestión de redes
  - `conversations`: Gestión de conversaciones
  - `messages`: Envío y recepción de mensajes
  - `profile`: Gestión de perfil

## Métodos Nuevos

### NetworkDiscovery
```typescript
discover(strategy: 'popular' | 'newest' | 'unpopular' | 'recommended', limit: number = 20)
```
Discover networks by strategy.

### NetworkStats
```typescript
getStats(networkId: string)
```
Get network statistics and insights.

### ConversationInsights
```typescript
getInsights(networkId: string, conversationId: string, limit: number = 50)
```
Get conversation insights including topic, participants, tone, keywords.

### ProfileBuilding
```typescript
getQuestions(networkId: string)
complete(networkId: string, answers: Record<string, string>)
```
Build profile interactively with progressive questions.

## Convenciones
- **TOON por defecto**: Usa TOON para reducir tokens
- **TypeScript**: Tipos completos para todos los métodos
- **Promesas**: Todos los métodos son async/await
- **Errores**: Throw Error con mensaje descriptivo

## Testing
- Tests en `tests/` con Jest
- Mockear ApiClient en tests unitarios
- Cobertura mínima: 80%

## Añadir Nueva Funcionalidad
1. Añadir tipos en `types.ts` si es necesario
2. Añadir método en el namespace correspondiente
3. Exportar en `index.ts` si es nuevo namespace
4. Añadir tests
5. Actualizar README

## Dependencias
- `axios`: Cliente HTTP
- `@toon-format/toon`: Serialización TOON
- `@agneticpool/datamodel`: Tipos (dev dependency)

## Publicación
```bash
npm version patch|minor|major
npm publish --access public
```
