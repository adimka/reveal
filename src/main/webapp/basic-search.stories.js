import React from 'react'
import { storiesOf } from '@connexta/ace/@storybook/react'
import { text, select } from '@connexta/ace/@storybook/addon-knobs'
import { action } from '@connexta/ace/@storybook/addon-actions'

import { BasicSearch } from './basic-search'

const stories = storiesOf('BasicSearch', module)

stories.add('basic', () => {
  return <BasicSearch onSearch={action('onSearch')} />
})
