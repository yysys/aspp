import { Intent, Toaster } from '@blueprintjs/core'
import { Map, Set } from 'immutable'
import { eventChannel } from 'redux-saga'
import { fork, put, select, take, takeEvery } from 'redux-saga/effects'
import { State } from '../reducers'
import Annotation from '../types/Annotation'
import Decoration from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import {
  acceptHints,
  addDecorations,
  removeDecorations,
  setRange,
  setSel,
  toast,
} from '../utils/actionCreators'
import Action from '../utils/actions'
import { keyed, toggle, toIdSet } from '../utils/common'
import InteractionCollector from '../utils/InteractionCollector'
import SelectionUtils from '../utils/SelectionUtils'
import fileSaga from './fileSaga'
import handleInteractions from './handleInteractions'
import handleSelectMatch from './handleSelectMatch'
import shortcutSaga from './shortcutSaga'

function* autoClearNativeSelectionAfterSetSel() {
  while (true) {
    const { sel }: Action.SetSel = yield take('R_SET_SEL')
    if (!sel.isEmpty()) {
      SelectionUtils.setCurrentRange(null)
    }
  }
}

function* autoClearSelAndUpdateRange() {
  const chan = eventChannel(emit => {
    const callback = () => emit('change')
    document.addEventListener('selectionchange', callback)
    return () => document.removeEventListener('selectionchange', callback)
  })

  try {
    while (true) {
      yield take(chan)
      const { main }: State = yield select()
      const nextRange = SelectionUtils.getCurrentRange()
      if (!main.sel.isEmpty() && nextRange != null) {
        yield put(setSel(Set()))
      }
      yield put(setRange(nextRange))
    }
  } finally {
    chan.close()
  }
}

function* handleAnnotateCurrent(collector: InteractionCollector, { tag }: Action.AnnotateCurrent) {
  const { main }: State = yield select()
  if (main.sel.isEmpty() && main.range == null) {
    yield put(toast('Invalid selection'))
    return
  }
  const gathered = main.gather()
  const selDecSet = main.sel.map(id => gathered.get(id))
  const setToAdd = main.sel.isEmpty()
    ? Set.of(Annotation.tagRange(tag, main.range.normalize()))
    : Annotation.tagSel(tag, selDecSet)
  const overlapped = setToAdd.some(dec1 =>
    gathered.some(dec2 => DecorationRange.isOverlapped(dec1.range, dec2.range)),
  )

  if (main.range) {
    collector.userAnnotateText(main.range, tag)
  }

  if (overlapped) {
    yield put(toast('Overlap'))
  } else {
    yield put(removeDecorations(main.sel))
    yield put(addDecorations(keyed(setToAdd)))
    yield put(setSel(toIdSet(setToAdd)))
  }
}

function* handleDeleteCurrent() {
  const { main }: State = yield select()
  const gathered = main.gather()
  if (main.sel.isEmpty()) {
    if (main.range == null) {
      yield put(toast('invalid range'))
    } else {
      const removing = main.range.filterIntersected(gathered)
      yield put(removeDecorations(toIdSet(removing)))
    }
  } else {
    yield put(removeDecorations(main.sel))
  }
}

function* handleAcceptCurrent() {
  const { main }: State = yield select()
  const gathered = main.gather()
  if (main.sel.isEmpty()) {
    if (main.range == null) {
      yield put(acceptHints(Map()))
    } else {
      yield put(acceptHints(main.range.filterIntersected(gathered).filter(Decoration.isHint)))
    }
  } else {
    yield put(acceptHints(keyed(main.sel.map(id => gathered.get(id)).filter(Decoration.isHint))))
  }
}

function* handleAcceptHints({ accepting }: Action.AcceptHints) {
  if (accepting.isEmpty()) {
    yield put(toast('No hints to accept'))
  } else {
    const actions = accepting.map(hint => hint.action).filter(Boolean)
    yield put(removeDecorations(toIdSet(accepting)))
    // TODO performance degradation
    // 用户可能会一下子选中很多 hint，然后一次性进行接受，这里一个一个处理 action 比较低效
    yield* actions.map(action => put(action)).valueSeq()
  }
}

function* handleClickDecoration({ decoration, ctrlKey }: Action.ClickDecoration) {
  const { main }: State = yield select()
  if (ctrlKey) {
    yield put(setSel(toggle(main.sel, decoration.id)))
  } else {
    yield put(setSel(Set.of(decoration.id)))
  }
}

const toaster = Toaster.create()
function handleToast({ message }: Action.Toast) {
  toaster.show({ intent: Intent.PRIMARY, message })
}

function* handleSelectBlockText({ blockIndex }: Action.SelectBlockText) {
  const { main }: State = yield select()
  const block = main.doc.blocks.get(blockIndex)
  SelectionUtils.setCurrentRange(
    new DecorationRange({
      blockIndex,
      startOffset: 0,
      endOffset: block.length,
    }),
  )
}

function* handleAcceptBlock({ blockIndex }: Action.AcceptBlock) {
  const { main }: State = yield select()
  yield put(acceptHints(main.hints.filter(dec => dec.range.blockIndex === blockIndex)))
}

function* handleClearBlockDecorations({ blockIndex }: Action.ClearBlockDecorations) {
  const { main }: State = yield select()
  const setToRemove = main.gather().filter(dec => dec.range.blockIndex === blockIndex)
  yield put(removeDecorations(setToRemove.keySeq().toSet()))
}

export default function* rootSaga() {
  const collector = new InteractionCollector()

  console.log('root-saga started')
  yield fork(autoClearSelAndUpdateRange)
  yield fork(autoClearNativeSelectionAfterSetSel)
  yield fork(shortcutSaga)
  yield fork(handleInteractions, collector)
  yield fork(fileSaga)

  yield takeEvery('ANNOTATE_CURRENT', handleAnnotateCurrent, collector)
  yield takeEvery('DELETE_CURRENT', handleDeleteCurrent)
  yield takeEvery('ACCEPT_CURRENT', handleAcceptCurrent)
  yield takeEvery('CLICK_DECORATION', handleClickDecoration)
  yield takeEvery('SELECT_MATCH', handleSelectMatch)
  yield takeEvery('TOAST', handleToast)
  yield takeEvery('SELECT_BLOCK_TEXT', handleSelectBlockText)
  yield takeEvery('ACCEPT_BLOCK', handleAcceptBlock)
  yield takeEvery('CLEAR_BLOCK_DECORATIONS', handleClearBlockDecorations)
  yield takeEvery('ACCEPT_HINTS', handleAcceptHints)
}
