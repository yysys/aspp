import { Map, Set } from 'immutable'
import { TreeState } from '../reducers/treeReducer'
import Annotation from '../types/Annotation'
import Decoration, { Hint, Slot } from '../types/Decoration'
import DecorationRange from '../types/DecorationRange'
import Action from './actions'

export function addAnnotations(annotations: Map<string, Annotation>): Action.AddAnnotations {
  return { type: 'R_ADD_ANNOTATIONS', annotations }
}

export function addSlots(slots: Map<string, Slot>): Action.AddSlots {
  return { type: 'R_ADD_SLOTS', slots }
}

export function addHints(hints: Map<string, Hint>): Action.AddHints {
  return { type: 'R_ADD_HINTS', hints }
}

export function deleteDecorations(idSet: Set<string>): Action.DeleteDecorations {
  return { type: 'R_DELETE_DECORATIONS', idSet }
}

export function setSel(sel: Set<string>): Action.SetSel {
  return { type: 'R_SET_SEL', sel }
}

export function selectBlockText(blockIndex: number): Action.SelectBlockText {
  return { type: 'SELECT_BLOCK_TEXT', blockIndex }
}

export function acceptBlock(blockIndex: number): Action.AcceptBlock {
  return { type: 'ACCEPT_BLOCK', blockIndex }
}

export function clearBlockDecorations(blockIndex: number): Action.ClearBlockDecorations {
  return { type: 'CLEAR_BLOCK_DECORATIONS', blockIndex }
}

export function setRange(range: DecorationRange): Action.SetRange {
  return { type: 'R_SET_RANGE', range }
}

export function toast(text: string): Action.Toast {
  return { type: 'TOAST', message: text }
}

export function annotateCurrent(tag: string): Action.AnnotateCurrent {
  return { type: 'ANNOTATE_CURRENT', tag }
}

export function deleteCurrent(): Action.DeleteCurrent {
  return { type: 'DELETE_CURRENT' }
}

export function acceptCurrent(): Action.AcceptCurrent {
  return { type: 'ACCEPT_CURRENT' }
}

export function clickDecoration(decoration: Decoration, ctrlKey: boolean): Action.ClickDecoration {
  return { type: 'CLICK_DECORATION', decoration, ctrlKey }
}

export function selectMatch(pattern: string | RegExp): Action.SelectMatch {
  return { type: 'SELECT_MATCH', pattern }
}

export function toggleDarkTheme(): Action.ToggleDarkTheme {
  return { type: 'R_TOGGLE_DARK_THEME' }
}

export function toggleTaskTreeVisibility(): Action.ToggleTaskTreeVisibility {
  return { type: 'R_TOGGLE_TASK_TREE_VISIBILITY' }
}

export function acceptHints(accepting: Map<string, Hint>): Action.AcceptHints {
  return { type: 'ACCEPT_HINTS', accepting }
}

export function requestDownloadResult(): Action.RequestDownloadResult {
  return { type: 'REQUEST_DOWNLOAD_RESULT' }
}

export function loadFileContent(content: string): Action.LoadFileContent {
  return { type: 'LOAD_FILE_CONTENT', content }
}

export function loadData(data: TreeState): Action.LoadData {
  return { type: 'LOAD_DATA', data }
}

export function clickDocTreeNode(docId: string): Action.ClickDocTreeNode {
  return { type: 'CLICK_DOC_TREE_NODE', docId }
}

export function clickAnnotationSetTreeNode(
  docId: string,
  annotationSetName: string,
): Action.ClickAnnotationSetTreeNode {
  return { type: 'CLICK_ANNOTATION_SET_TREE_NODE', docId, annotationSetName }
}

export function requestAddAnnotationSet(docId: string): Action.RequestAddAnnotationSet {
  return { type: 'REQUEST_ADD_ANNOTATION_SET', docId }
}

export function requestDeleteAnnotationSet(
  docId: string,
  annotationSetName: string,
): Action.RequestDeleteAnnotationSet {
  return { type: 'REQUEST_DELETE_ANNOTATION_SET', docId, annotationSetName }
}
