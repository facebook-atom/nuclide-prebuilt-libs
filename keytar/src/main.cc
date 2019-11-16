#include <node_version.h>

#include "nan.h"
#include "async.h"

namespace {

NAN_METHOD(SetPassword) {
  SetPasswordWorker* worker = new SetPasswordWorker(
#if NODE_MODULE_VERSION >= 72
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[0]),
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[1]),
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[2]),
#else
    *v8::String::Utf8Value(info[0]),
    *v8::String::Utf8Value(info[1]),
    *v8::String::Utf8Value(info[2]),
#endif    
    new Nan::Callback(info[3].As<v8::Function>()));
  Nan::AsyncQueueWorker(worker);
}

NAN_METHOD(GetPassword) {
  GetPasswordWorker* worker = new GetPasswordWorker(
#if NODE_MODULE_VERSION >= 72
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[0]),
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[1]),
#else
    *v8::String::Utf8Value(info[0]),
    *v8::String::Utf8Value(info[1]),
#endif    
    new Nan::Callback(info[2].As<v8::Function>()));
  Nan::AsyncQueueWorker(worker);
}

NAN_METHOD(DeletePassword) {
  DeletePasswordWorker* worker = new DeletePasswordWorker(
#if NODE_MODULE_VERSION >= 72
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[0]),
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[1]),
#else
    *v8::String::Utf8Value(info[0]),
    *v8::String::Utf8Value(info[1]),
#endif    
    new Nan::Callback(info[2].As<v8::Function>()));
  Nan::AsyncQueueWorker(worker);
}

NAN_METHOD(FindPassword) {
  FindPasswordWorker* worker = new FindPasswordWorker(
#if NODE_MODULE_VERSION >= 72
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[0]),
#else
    *v8::String::Utf8Value(info[0]),
#endif    
    new Nan::Callback(info[1].As<v8::Function>()));
  Nan::AsyncQueueWorker(worker);
}

NAN_METHOD(FindCredentials) {
  FindCredentialsWorker* worker = new FindCredentialsWorker(
#if NODE_MODULE_VERSION >= 72
    *v8::String::Utf8Value(v8::Isolate::GetCurrent(), info[0]),
#else
    *v8::String::Utf8Value(info[0]),
#endif    
    new Nan::Callback(info[1].As<v8::Function>()));
  Nan::AsyncQueueWorker(worker);
}

void Init(v8::Local<v8::Object> exports) {
  Nan::SetMethod(exports, "getPassword", GetPassword);
  Nan::SetMethod(exports, "setPassword", SetPassword);
  Nan::SetMethod(exports, "deletePassword", DeletePassword);
  Nan::SetMethod(exports, "findPassword", FindPassword);
  Nan::SetMethod(exports, "findCredentials", FindCredentials);
}

}  // namespace

NODE_MODULE(keytar, Init)
