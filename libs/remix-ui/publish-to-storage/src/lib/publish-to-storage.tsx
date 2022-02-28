import React, { useEffect, useState } from 'react' // eslint-disable-line
import { ModalDialog } from '@remix-ui/modal-dialog' // eslint-disable-line
import { RemixUiPublishToStorageProps } from './types' // eslint-disable-line
import { publishToIPFS } from './publishToIPFS'
import { publishToSwarm } from './publishOnSwarm'

export const PublishToStorage = (props: RemixUiPublishToStorageProps) => {
  const { api, storage, contract, resetStorage, filePath, compileTabLogic } = props
  const [state, setState] = useState({
    modal: {
      title: '',
      message: null,
      hide: true,
      okLabel: '',
      okFn: null,
      cancelLabel: '',
      cancelFn: null
    }
  })

  useEffect(() => {
    const storageService = async () => {
      if ((contract.metadata === undefined || contract.metadata.length === 0)) {
        modal('Publish To Storage', 'This contract may be abstract, may not implement an abstract parent\'s methods completely or not invoke an inherited contract\'s constructor correctly.')
      } else {
        if (storage === 'swarm') {
          try {
            const result = await publishToSwarm(contract, api)

            modal(`Published ${contract.name}'s Metadata`, publishMessage(result.uploaded))
            // triggered each time there's a new verified publish (means hash correspond)
            api.writeFile('swarm/' + result.item.hash, result.item.content)
          } catch (err) {
            let parseError = err
            try {
              parseError = JSON.stringify(err)
            } catch (e) {}
            modal('Swarm Publish Failed', publishMessageFailed(storage, parseError))
          }
        } else {
          try {
            const result = await publishToIPFS(contract, api)

            modal(`Published ${contract.name}'s Metadata`, publishMessage(result.uploaded))
            // triggered each time there's a new verified publish (means hash correspond)
            api.writeFile('ipfs/' + result.item.hash, result.item.content)

            // throw in ABI into contract
            console.log("contract: ", contract);
            console.log("filePath: ", filePath);

            const solFile = await api.readFile(filePath);
            const moddedSolFile = solFile.replace("ipfs.io/ipfs/AUTOGEN", "ipfs.io/ipfs/" + result.abi.hash);
            api.writeFile(filePath, moddedSolFile);

            const hhCompilation = api.getAppParameter('hardhat-compilation');
            compileTabLogic.runCompiler(hhCompilation);
          } catch (err) {
            modal('IPFS Publish Failed', publishMessageFailed(storage, err))
          }
        }
      }
    }

    if (storage) {
      storageService()
    }
  }, [storage])

  const publishMessage = (uploaded) => (
    <span> Metadata of "{contract.name.toLowerCase()}" was published successfully. <br />
      <pre>
        <div>
          { uploaded.map((value, index) => <div key={index}><b>{ value.filename }</b> : <pre>{ value.output.url }</pre></div>) }
        </div>
      </pre>
    </span>
  )

  const publishMessageFailed = (storage, err) => (
    <span>Failed to publish metadata file to { storage }, please check the { storage } gateways is available. <br />
      {err}
    </span>
  )

  const handleHideModal = () => {
    setState(prevState => {
      return { ...prevState, modal: { ...prevState.modal, hide: true, message: null } }
    })
    resetStorage()
  }

  const modal = async (title: string, message: string | JSX.Element) => {
    await setState(prevState => {
      return {
        ...prevState,
        modal: {
          ...prevState.modal,
          hide: false,
          message,
          title
        }
      }
    })
  }

  return (
    <ModalDialog
      id={props.id || 'publishToStorage'}
      title={ state.modal.title }
      message={ state.modal.message }
      hide={ state.modal.hide }
      okLabel='OK'
      okFn={() => {}}
      handleHide={ handleHideModal }>
      { (typeof state.modal.message !== 'string') && state.modal.message }
    </ModalDialog>
  )
}

export default PublishToStorage
