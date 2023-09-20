// Copyright (C) 2023 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

import { ComponentPropsWithRef, forwardRef, useState } from 'react'
import classNames from 'classnames'
import { Button, Dropdown, SideDrawerCloseIcon } from '../common'
import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faEarListen,
  faTicket,
  faPhoneSlash,
  faPhone,
  faEllipsisVertical,
  faHandPointUp,
  faArrowLeft,
  faCirclePause,
  faMicrophoneSlash,
  faRecordVinyl,
} from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { RootState } from '../../store'
import { CallDuration } from './CallDuration'
import { LastCallsDrawerTable } from '../history/LastCallsDrawerTable'
import { startOfDay, subDays } from 'date-fns'
import { OperatorSummary } from './OperatorSummary'
import { useTranslation } from 'react-i18next'
import { isEmpty } from 'lodash'
import { postRecallOnBusy, hangup, startListen, toggleRecord, intrude } from '../../lib/operators'
import { openToast } from '../../lib/utils'

export interface ShowOperatorDrawerContentProps extends ComponentPropsWithRef<'div'> {
  config: any
}

export const ShowOperatorDrawerContent = forwardRef<
  HTMLButtonElement,
  ShowOperatorDrawerContentProps
>(({ config, className, ...props }, ref) => {
  const profile = useSelector((state: RootState) => state.user)
  const operators = useSelector((state: RootState) => state.operators)
  const [isFavorite, setFavorite] = useState(false)
  const { t } = useTranslation()

  const auth = useSelector((state: RootState) => state.authentication)
  const username = auth.username

  useEffect(() => {
    setFavorite(config.favorite)
  }, [config])

  async function recallOnBusyPost(objectRecallOnBusy: any) {
    let recallOnBusyInformations: any = {}
    if (profile?.mainextension && config?.endpoints?.mainextension[0]?.id) {
      //create object with information for recall on busy post api
      //caller is user main extension
      //called is main extension of user that is busy
      recallOnBusyInformations = {
        caller: profile?.mainextension,
        called: objectRecallOnBusy?.endpoints?.mainextension[0]?.id,
      }
      if (!isEmpty(recallOnBusyInformations)) {
        try {
          const res = await postRecallOnBusy(recallOnBusyInformations)

          let waitingNumber = res.waitingExtensions
          showToast(waitingNumber)
        } catch (e) {
          console.error(e)
          return []
        }
      }
    }
  }

  async function hangupConversation(objectHangupConversation: any) {
    if (objectHangupConversation?.conversations[0]?.id) {
      const conversationId = objectHangupConversation?.conversations[0]?.id
      let numberToClose = ''
      if (conversationId) {
        // Get number to close from conversation id
        const numberToClose = conversationId?.match(/\/(\d+)-/)
        if (numberToClose) {
          const endpointId = numberToClose[1]

          const hangupInformations = {
            convid: conversationId.toString(),
            endpointId: endpointId.toString(),
          }

          if (!isEmpty(hangupInformations)) {
            try {
              await hangup(hangupInformations)
            } catch (e) {
              console.error(e)
              return []
            }
          }
        }
      }
    }
  }

  async function listenConversation(objectListenConversation: any) {
    // if main user is not in conversation enable listen conversation

    if (
      objectListenConversation?.conversations[0]?.id &&
      isEmpty(operators?.operators[username]?.conversations)
    ) {
      const conversationId = objectListenConversation?.conversations[0]?.id
      let numberToSendCall = ''
      if (operators?.operators[username].endpoints?.mainextension[0]?.id) {
        numberToSendCall =
          operators?.operators[username].endpoints?.mainextension[0]?.id?.toString()
      }
      if (conversationId) {
        const numberToListen = conversationId?.match(/\/(\d+)-/)
        if (numberToListen) {
          const endpointId = numberToListen[1]

          const listenInformations = {
            convid: conversationId.toString(),
            destId: numberToSendCall,
            endpointId: endpointId.toString(),
          }

          if (!isEmpty(listenInformations)) {
            try {
              await startListen(listenInformations)
            } catch (e) {
              console.error(e)
              return []
            }
          }
        }
      }
    }
  }

  async function intrudeConversation(objectIntrudeConversation: any) {
    // if main user is not in conversation enable intrude in to conversation

    if (
      objectIntrudeConversation?.conversations[0]?.id &&
      isEmpty(operators?.operators[username]?.conversations)
    ) {
      const conversationId = objectIntrudeConversation?.conversations[0]?.id
      let numberToSendCall = ''
      if (operators?.operators[username].endpoints?.mainextension[0]?.id) {
        numberToSendCall =
          operators?.operators[username].endpoints?.mainextension[0]?.id?.toString()
      }
      if (conversationId) {
        const numberToIntrude = conversationId?.match(/\/(\d+)-/)
        if (numberToIntrude) {
          const endpointId = numberToIntrude[1]

          const intrudeInformations = {
            convid: conversationId.toString(),
            destId: numberToSendCall,
            endpointId: endpointId.toString(),
          }

          if (!isEmpty(intrudeInformations)) {
            try {
              await intrude(intrudeInformations)
            } catch (e) {
              console.error(e)
              return []
            }
          }
        }
      }
    }
  }

  async function recordConversation(objectListenConversation: any) {
    // if main user is not in conversation enable listen conversation

    if (
      objectListenConversation?.conversations[0]?.id != '' &&
      operators?.operators[username]?.endpoints?.mainextension[0]?.id !== '' &&
      operators?.operators[objectListenConversation.username]?.conversations &&
      operators?.operators[objectListenConversation.username]?.conversations[0]?.recording
    ) {
      const conversationId = objectListenConversation?.conversations[0]?.id
      if (conversationId) {
        const numberToSendCall = conversationId?.match(/\/(\d+)-/)
        if (numberToSendCall) {
          const endpointId = numberToSendCall[1]
          const listenInformations = {
            convid: conversationId.toString(),
            endpointId: endpointId.toString(),
          }
          let recordingValues = ''
          switch (
            operators?.operators[objectListenConversation.username]?.conversations[0]?.recording
          ) {
            case 'false':
              recordingValues = 'not_started'
              break
            case 'true':
              recordingValues = 'started'
              break
            case 'mute':
              recordingValues = 'muted'
              break
            default:
              recordingValues = ''
              break
          }

          if (!isEmpty(listenInformations)) {
            try {
              await toggleRecord(recordingValues, listenInformations)
            } catch (e) {
              console.error(e)
              return []
            }
          }
        }
      }
    }
  }

  const showToast = (extensionWaiting: any) => {
    openToast(
      'success',
      `${t('Operators.Recall on busy message', { extensionWaiting })}`,
      `${t('Operators.Recall on busy', { extensionWaiting })}`,
    )
  }

  const getCallActionsMenu = (config: any) => {
    return (
      <>
        {profile?.recallOnBusy && (
          <>
            <Dropdown.Item icon={faTicket} onClick={() => recallOnBusyPost(config)}>
              {t('OperatorDrawer.Book')}
            </Dropdown.Item>
          </>
        )}
        {profile?.profile?.macro_permissions?.presence_panel?.permissions?.hangup?.value && (
          <Dropdown.Item icon={faPhoneSlash} onClick={() => hangupConversation(config)}>
            {t('OperatorDrawer.Hangup')}
          </Dropdown.Item>
        )}
        {profile?.profile?.macro_permissions?.presence_panel?.permissions?.spy?.value && (
          <Dropdown.Item icon={faEarListen} onClick={() => listenConversation(config)}>
            {t('OperatorDrawer.Listen')}
          </Dropdown.Item>
        )}
        {profile?.profile?.macro_permissions?.presence_panel?.permissions?.intrude?.value && (
          <Dropdown.Item icon={faHandPointUp} onClick={() => intrudeConversation(config)}>
            {' '}
            {t('OperatorDrawer.Intrude')}
          </Dropdown.Item>
        )}

        {profile?.profile?.macro_permissions?.presence_panel?.permissions?.ad_recording?.value && (
          <Dropdown.Item
            icon={
              operators?.operators[config.username]?.conversations &&
              operators?.operators[config.username]?.conversations[0]?.recording &&
              operators?.operators[config.username]?.conversations[0]?.recording === 'true'
                ? faCirclePause
                : operators?.operators[config.username]?.conversations &&
                  operators?.operators[config.username]?.conversations[0]?.recording === 'false'
                ? faRecordVinyl
                : faMicrophoneSlash
            }
            onClick={() => recordConversation(config)}
          >
            {operators?.operators[config.username]?.conversations &&
            operators?.operators[config.username]?.conversations[0]?.recording &&
            operators?.operators[config.username]?.conversations[0]?.recording === 'true'
              ? t('OperatorDrawer.Stop recording')
              : operators?.operators[config.username]?.conversations &&
                operators?.operators[config.username]?.conversations[0]?.recording === 'false'
              ? t('OperatorDrawer.Start recording')
              : t('OperatorDrawer.Restart recording')}
          </Dropdown.Item>
        )}
      </>
    )
  }

  return (
    <>
      <div className='bg-gray-100 dark:bg-gray-800 py-6 px-6'>
        <div className='flex items-center justify-between'>
          <div className='text-lg font-medium dark:text-gray-200 text-gray-700'>
            {t('OperatorDrawer.Operator details')}
          </div>
          <div className='flex items-center h-7'>
            <SideDrawerCloseIcon className='p-0.5' />
          </div>
        </div>
      </div>
      <div className={classNames('p-5', className)} {...props}>
        <OperatorSummary operator={config} isShownFavorite={true} isShownSideDrawerLink={false} />

        {/* ongoing call info */}
        {!!config?.conversations?.length &&
          (config?.conversations[0]?.connected ||
            config?.conversations[0]?.inConference ||
            config?.conversations[0]?.chDest?.inConference == true) && (
            <div>
              <div className='mt-6 flex items-end justify-between'>
                <h4 className='text-md font-medium text-gray-700 dark:text-gray-200'>
                  {t('OperatorDrawer.Current call')}
                </h4>
                <div>
                  {config?.conversations[0]?.chDest?.callerName != profile?.name &&
                    config?.conversations[0]?.chSource?.callerName != profile?.name && (
                      <>
                        {/* ongoing call menu */}
                        <Dropdown items={getCallActionsMenu(config)} position='left'>
                          <Button variant='ghost'>
                            <FontAwesomeIcon icon={faEllipsisVertical} className='h-4 w-4' />
                            <span className='sr-only'>
                              {t('OperatorDrawer.Open call actions menu')}
                            </span>
                          </Button>
                        </Dropdown>
                      </>
                    )}
                </div>
              </div>
              <div className='mt-4 border-t border-gray-200 dark:border-gray-700'>
                <dl>
                  {/*  contact */}
                  <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                    <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      {t('OperatorDrawer.Contact')}
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                      {config?.conversations[0]?.counterpartName !==
                        config?.conversations[0]?.counterpartNum && (
                        <div className='mb-1.5 flex items-center text-sm'>
                          <span className='truncate'>
                            {config?.conversations[0]?.counterpartName || '-'}
                          </span>
                        </div>
                      )}
                      {/*  number */}
                      <div className='flex items-center text-sm'>
                        <FontAwesomeIcon
                          icon={faPhone}
                          className='mr-2 h-4 w-4 flex-shrink-0 text-gray-400 dark:text-gray-500'
                          aria-hidden='true'
                        />
                        <span className='truncate'>
                          {config?.conversations[0]?.counterpartNum || '-'}
                        </span>
                      </div>
                    </dd>
                  </div>
                  {/*  direction */}
                  <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                    <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      {t('OperatorDrawer.Direction')}
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                      {config?.conversations[0]?.direction == 'out' && (
                        <div className='flex items-center text-sm'>
                          <FontAwesomeIcon
                            icon={faArrowLeft}
                            className='mr-2 h-5 w-3.5 rotate-[135deg] text-green-600 dark:text-green-500'
                            aria-hidden='true'
                          />
                          <span className='truncate'> {t('OperatorDrawer.Outgoing')}</span>
                        </div>
                      )}
                      {config?.conversations[0]?.direction == 'in' && (
                        <div className='flex items-center text-sm'>
                          <FontAwesomeIcon
                            icon={faArrowLeft}
                            className='mr-2 h-5 w-3.5 -rotate-45 text-green-600 dark:text-green-500'
                            aria-hidden='true'
                          />
                          <span className='truncate'>{t('OperatorDrawer.Incoming')}</span>
                        </div>
                      )}
                    </dd>
                  </div>
                  {/*  duration */}
                  <div className='py-4 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-5'>
                    <dt className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                      {t('OperatorDrawer.Duration')}
                    </dt>
                    <dd className='mt-1 text-sm text-gray-900 dark:text-gray-100 sm:col-span-2 sm:mt-0'>
                      <div
                        className='flex items-center text-sm'
                        key={`callDuration-${config?.username}`}
                      >
                        <CallDuration startTime={config?.conversations[0]?.startTime} />
                      </div>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        {/* last calls: search all operator extensions */}
        {profile?.profile?.macro_permissions?.cdr?.permissions?.ad_cdr?.value && (
          <LastCallsDrawerTable
            callType={config?.lastCallsType || 'switchboard'}
            dateFrom={startOfDay(subDays(new Date(), 7))}
            dateTo={new Date()}
            phoneNumbers={config?.endpoints?.extension?.map((ext: any) => ext.id)}
            limit={10}
          />
        )}
      </div>
    </>
  )
})

ShowOperatorDrawerContent.displayName = 'ShowOperatorDrawerContent'
