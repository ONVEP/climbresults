import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'live': { paramsTuple?: []; params?: {} }
    'climbers.index': { paramsTuple?: []; params?: {} }
    'climbers.create': { paramsTuple?: []; params?: {} }
    'climbers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'climbers.set_category': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'categories.create': { paramsTuple?: []; params?: {} }
    'categories.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.poll': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.start_auto_poll': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.stop_auto_poll': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category_climbers.set_place': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category_climbers.results': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'route': ParamValue} }
    'category_climbers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'timer.start': { paramsTuple?: []; params?: {} }
    'timer.pause': { paramsTuple?: []; params?: {} }
    'timer.reset': { paramsTuple?: []; params?: {} }
    'timer.adjust': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'logs.clear': { paramsTuple?: []; params?: {} }
    'logs.content': { paramsTuple?: []; params?: {} }
    'api.get_current_category': { paramsTuple?: []; params?: {} }
    'api.set_current_category': { paramsTuple?: []; params?: {} }
    'api.clibmers_by_group': { paramsTuple: [ParamValue]; params: {'group': ParamValue} }
    'cg_api.show_timer': { paramsTuple?: []; params?: {} }
    'cg_api.hide_timer': { paramsTuple?: []; params?: {} }
    'cg_api.hide_left_climber': { paramsTuple?: []; params?: {} }
    'cg_api.set_left_climber': { paramsTuple: [ParamValue]; params: {'climberId': ParamValue} }
    'cg_api.hide_right_climber': { paramsTuple?: []; params?: {} }
    'cg_api.set_right_climber': { paramsTuple: [ParamValue]; params: {'climberId': ParamValue} }
    'cg_api.hide_results': { paramsTuple?: []; params?: {} }
    'cg_api.set_results': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'cg_api.hide_lateral': { paramsTuple?: []; params?: {} }
    'cg_api.set_lateral': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'cg.data': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'live': { paramsTuple?: []; params?: {} }
    'climbers.index': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'logs.content': { paramsTuple?: []; params?: {} }
    'api.get_current_category': { paramsTuple?: []; params?: {} }
    'api.clibmers_by_group': { paramsTuple: [ParamValue]; params: {'group': ParamValue} }
  }
  HEAD: {
    'event_stream': { paramsTuple?: []; params?: {} }
    'live': { paramsTuple?: []; params?: {} }
    'climbers.index': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'logs.content': { paramsTuple?: []; params?: {} }
    'api.get_current_category': { paramsTuple?: []; params?: {} }
    'api.clibmers_by_group': { paramsTuple: [ParamValue]; params: {'group': ParamValue} }
  }
  POST: {
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'climbers.create': { paramsTuple?: []; params?: {} }
    'categories.create': { paramsTuple?: []; params?: {} }
    'categories.poll': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.start_auto_poll': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.stop_auto_poll': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'timer.start': { paramsTuple?: []; params?: {} }
    'timer.pause': { paramsTuple?: []; params?: {} }
    'timer.reset': { paramsTuple?: []; params?: {} }
    'timer.adjust': { paramsTuple?: []; params?: {} }
    'logs.clear': { paramsTuple?: []; params?: {} }
    'api.set_current_category': { paramsTuple?: []; params?: {} }
    'cg_api.show_timer': { paramsTuple?: []; params?: {} }
    'cg_api.hide_timer': { paramsTuple?: []; params?: {} }
    'cg_api.hide_left_climber': { paramsTuple?: []; params?: {} }
    'cg_api.set_left_climber': { paramsTuple: [ParamValue]; params: {'climberId': ParamValue} }
    'cg_api.hide_right_climber': { paramsTuple?: []; params?: {} }
    'cg_api.set_right_climber': { paramsTuple: [ParamValue]; params: {'climberId': ParamValue} }
    'cg_api.hide_results': { paramsTuple?: []; params?: {} }
    'cg_api.set_results': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'cg_api.hide_lateral': { paramsTuple?: []; params?: {} }
    'cg_api.set_lateral': { paramsTuple: [ParamValue]; params: {'categoryId': ParamValue} }
    'cg.data': { paramsTuple?: []; params?: {} }
  }
  DELETE: {
    'climbers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category_climbers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
  PATCH: {
    'climbers.set_category': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category_climbers.set_place': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category_climbers.results': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'route': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}