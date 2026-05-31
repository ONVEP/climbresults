import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'drive.images.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'subscribe': { paramsTuple?: []; params?: {} }
    'unsubscribe': { paramsTuple?: []; params?: {} }
    'live': { paramsTuple?: []; params?: {} }
    'climbers.index': { paramsTuple?: []; params?: {} }
    'climbers.create': { paramsTuple?: []; params?: {} }
    'climbers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
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
    'timer.state': { paramsTuple?: []; params?: {} }
    'images.index': { paramsTuple?: []; params?: {} }
    'images.upload': { paramsTuple?: []; params?: {} }
    'config.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'logs.clear': { paramsTuple?: []; params?: {} }
    'logs.content': { paramsTuple?: []; params?: {} }
    'api.get_current_category': { paramsTuple: [ParamValue]; params: {'slot': ParamValue} }
    'api.set_current_category': { paramsTuple: [ParamValue]; params: {'slot': ParamValue} }
    'api.clibmers_by_group': { paramsTuple: [ParamValue,ParamValue]; params: {'group': ParamValue,'slot': ParamValue} }
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
    'config.get_config': { paramsTuple?: []; params?: {} }
    'config.update_config': { paramsTuple?: []; params?: {} }
    'cg.data': { paramsTuple?: []; params?: {} }
  }
  GET: {
    'drive.images.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'live': { paramsTuple?: []; params?: {} }
    'climbers.index': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'timer.state': { paramsTuple?: []; params?: {} }
    'images.index': { paramsTuple?: []; params?: {} }
    'config.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'logs.content': { paramsTuple?: []; params?: {} }
    'api.get_current_category': { paramsTuple: [ParamValue]; params: {'slot': ParamValue} }
    'api.clibmers_by_group': { paramsTuple: [ParamValue,ParamValue]; params: {'group': ParamValue,'slot': ParamValue} }
    'config.get_config': { paramsTuple?: []; params?: {} }
  }
  HEAD: {
    'drive.images.serve': { paramsTuple: [...ParamValue[]]; params: {'*': ParamValue[]} }
    'event_stream': { paramsTuple?: []; params?: {} }
    'live': { paramsTuple?: []; params?: {} }
    'climbers.index': { paramsTuple?: []; params?: {} }
    'categories.index': { paramsTuple?: []; params?: {} }
    'timer.state': { paramsTuple?: []; params?: {} }
    'images.index': { paramsTuple?: []; params?: {} }
    'config.index': { paramsTuple?: []; params?: {} }
    'logs.index': { paramsTuple?: []; params?: {} }
    'logs.content': { paramsTuple?: []; params?: {} }
    'api.get_current_category': { paramsTuple: [ParamValue]; params: {'slot': ParamValue} }
    'api.clibmers_by_group': { paramsTuple: [ParamValue,ParamValue]; params: {'group': ParamValue,'slot': ParamValue} }
    'config.get_config': { paramsTuple?: []; params?: {} }
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
    'images.upload': { paramsTuple?: []; params?: {} }
    'logs.clear': { paramsTuple?: []; params?: {} }
    'api.set_current_category': { paramsTuple: [ParamValue]; params: {'slot': ParamValue} }
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
    'config.update_config': { paramsTuple?: []; params?: {} }
    'cg.data': { paramsTuple?: []; params?: {} }
  }
  PATCH: {
    'climbers.update': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'climbers.set_category': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category_climbers.set_place': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category_climbers.results': { paramsTuple: [ParamValue,ParamValue]; params: {'id': ParamValue,'route': ParamValue} }
  }
  DELETE: {
    'climbers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'categories.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'category_climbers.delete': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}