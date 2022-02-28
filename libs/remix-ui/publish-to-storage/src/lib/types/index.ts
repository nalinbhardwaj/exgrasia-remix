export interface RemixUiPublishToStorageProps {
  id?: string
  api: any,
  storage: 'swarm' | 'ipfs',
  contract: any,
  filePath: string | null,
  compileTabLogic: any,
  resetStorage: () => void
}
