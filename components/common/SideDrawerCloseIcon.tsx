// Copyright (C) 2022 Nethesis S.r.l.
// SPDX-License-Identifier: AGPL-3.0-or-later

/**
 *
 * It can be used to render side drawer close icon.
 *
 *
 */

import { FC, ComponentProps } from 'react'
import classNames from 'classnames'
import { useTheme } from '../../theme/Context'
import { closeSideDrawer } from '../../lib/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { Button } from './Button'

export interface SideDrawerCloseIconProps extends ComponentProps<'div'> {}

export const SideDrawerCloseIcon: FC<SideDrawerCloseIconProps> = ({ className }): JSX.Element => {
  const { crossIcon: theme } = useTheme().theme
  return (
    <Button variant='ghost'>
      <FontAwesomeIcon
        className={classNames(theme.base, className)}
        icon={faXmark}
        onClick={() => closeSideDrawer()}
      />
    </Button>
  )
}
SideDrawerCloseIcon.displayName = 'SideDrawerCloseIcon'
