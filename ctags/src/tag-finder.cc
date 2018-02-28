#include "tag-finder.h"

void TagFinder::Execute() {
  tagEntry entry;
  if (tagsFind(file, &entry, tag.data(), options) == TagSuccess) {
    do {
      // Malformed tags files may have NULL file paths.
      if (entry.file != NULL) {
        matches.push_back(Tag(entry));
      }
    } while (
      (limit == 0 || matches.size() < limit) &&
      tagsFindNext(file, &entry) == TagSuccess
    );
  }
}

void TagFinder::HandleOKCallback() {
  Nan::HandleScope handle_scope;

  Local<Array> array = Nan::New<Array>(matches.size());
  for (size_t i = 0; i < matches.size(); i++) {
    array->Set(i, matches[i].toV8Object());
  }

  Local<Value> argv[] = { Nan::Null(), array };
  callback->Call(2, argv);
}
