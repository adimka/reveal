import React, { useState } from 'react'
import { connect } from 'react-redux'
import { Set } from 'immutable'
import { getSelected, setSelected } from '../store/results'
import { useKeyPressed } from '../react-hooks'

import Paper from '@material-ui/core/Card'
import Table from '@material-ui/core/Table'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import TableHead from '@material-ui/core/TableHead'
import TableRow from '@material-ui/core/TableRow'
import TableCell from '@material-ui/core/TableCell'
import TableBody from '@material-ui/core/TableBody'
import More from '@material-ui/icons/UnfoldMore'
import Less from '@material-ui/icons/UnfoldLess'
import DefaultThumbnail from '../thumbnail/thumbnail'
import Button from '@material-ui/core/Button'

const cellStyles = {
  minWidth: 150,
  maxWidth: 450,
}

const ExpandButton = props => {
  const { expanded, onClick } = props
  return (
    <Button
      style={{
        minWidth: 25,
        marginLeft: 5,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={onClick}
    >
      {expanded ? <Less /> : <More />}
    </Button>
  )
}

const Description = props => {
  const [expanded, setExpanded] = useState(false)
  const { text } = props
  const long = text.length > 250

  return (
    <div
      style={{
        ...cellStyles,
        display: 'flex',
        width: '20vw',
        alignItems: 'stretch',
      }}
    >
      <Typography>
        {!long || expanded ? text : text.substring(0, 100).concat('...')}
      </Typography>
      {long ? (
        <ExpandButton
          expanded={expanded}
          onClick={e => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        />
      ) : null}
    </div>
  )
}

const getCellContent = (attribute, result, Thumbnail) => {
  switch (attribute) {
    case 'thumbnail':
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Thumbnail {...result} />
        </div>
      )
    case 'description':
      return <Description text={result.description} />
    default:
      return (
        <Typography style={{ ...cellStyles }}>{result[attribute]}</Typography>
      )
  }
}

const Result = props => {
  const { attributes, selected, id, onClick, Thumbnail, ...rest } = props
  return (
    <TableRow onClick={onClick} key={id} selected={selected}>
      {attributes.map(attribute => (
        <TableCell key={attribute}>
          {getCellContent(attribute.toLowerCase(), { id, ...rest }, Thumbnail)}
        </TableCell>
      ))}
    </TableRow>
  )
}

const DDFThumbnail = props => {
  const src = props.actions.find(
    ({ id }) => id === 'catalog.data.metacard.thumbnail'
  )
  return <DefaultThumbnail src={src} {...props} />
}

const computeSelected = (selection, results, start, end, e) => {
  const clicked = results[end].id
  if (e.ctrlKey || e.metaKey) {
    return selection.has(clicked)
      ? selection.remove(clicked)
      : selection.add(clicked)
  }
  if (e.shiftKey && start !== null) {
    const slice =
      start < end
        ? results.slice(start, end + 1)
        : results.slice(end, start + 1)
    const group = Set(slice.map(({ id }) => id))
    return group.union(selection)
  }
  return selection.has(clicked) ? Set() : Set([results[end].id])
}

const Results = props => {
  const { results, attributes, onSelect, Thumbnail = DDFThumbnail } = props
  const selection = Set(props.selection)
  const [lastSelected, setLastSelected] = useState(null)
  const allowTextSelect = !useKeyPressed('Shift')

  return (
    <div style={{ height: '100%' }}>
      <Toolbar style={{ height: '10%' }}>
        <Typography variant="h5" component="h1">
          Search Results
        </Typography>
      </Toolbar>
      <Paper style={{ height: '90%', overflow: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              {attributes.map(attribute => (
                <TableCell key={attribute}>
                  <Typography>{attribute}</Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody style={{ userSelect: allowTextSelect ? 'auto' : 'none' }}>
            {results.map((result, i) => (
              <Result
                {...result}
                Thumbnail={Thumbnail}
                attributes={attributes}
                selected={selection.has(result.id)}
                onClick={e => {
                  e.stopPropagation()
                  const selected = computeSelected(
                    selection,
                    results,
                    lastSelected,
                    i,
                    e
                  )
                  onSelect(selected)
                  setLastSelected(e.shiftKey ? lastSelected : i)
                }}
              />
            ))}
          </TableBody>
        </Table>
      </Paper>
    </div>
  )
}

const mapStateToProps = state => ({
  selection: getSelected(state),
})

const mapDispatchToProps = {
  onSelect: setSelected,
}

export { Results }
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Results)
