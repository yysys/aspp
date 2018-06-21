import { Map } from 'immutable'
import { put, select } from 'little-saga/compat'
import React from 'react'
import { Rich } from '../components/panels/rich'
import { State } from '../reducers'
import { addAnnotations, addHints, addSlots, deleteDecorations } from '../reducers/mainReducer'
import Decoration from '../types/Decoration'
import { shortenText, toIdSet } from '../utils/common'
import MainAction from './MainAction'

export default class DeleteDecorations extends MainAction {
  message: JSX.Element

  constructor(readonly removing: Map<string, Decoration>) {
    super()
  }

  getMessage() {
    return this.message
  }

  *prepare() {
    const { main }: State = yield select()
    this.message = (
      <span>
        删除{' '}
        {this.removing
          .valueSeq()
          .map(({ range }) => range.substring(main.blocks.get(range.blockIndex)))
          .map((text, index) => <span key={index}>{Rich.string(shortenText(15, text))}</span>)
          .toArray()}
        等 {Rich.number(this.removing.count())} 个对象
      </span>
    )
  }

  *prev() {
    yield put(addHints(this.removing.filter(Decoration.isHint)))
    yield put(addSlots(this.removing.filter(Decoration.isSlot)))
    yield put(addAnnotations(this.removing.filter(Decoration.isAnnotation)))
  }

  *next() {
    yield put(deleteDecorations(toIdSet(this.removing)))
  }
}