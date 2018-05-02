import { Record, Set } from 'immutable'
import PlainDoc from './PlainDoc'
import Annotation from './Annotation'

const AnnotatedDocRecord = Record({
  id: '',
  author: '',
  plainDoc: new PlainDoc(),
  annotationSet: Set<Annotation>(),
})

export default class AnnotatedDoc extends AnnotatedDocRecord {
  static fromJS(object: any) {
    return new AnnotatedDoc(object)
      .update('plainDoc', PlainDoc.fromJS)
      .update('annotationSet', set => Set(set).map(Annotation.fromJS))
  }
}
