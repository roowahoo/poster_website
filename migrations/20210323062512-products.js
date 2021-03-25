'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('products',{
      id: { type: 'int', primaryKey:true, autoIncrement:true, },
      title: { type: 'string', length:100},
      height: {type:'int',notNull:true},
      width:{type:'int',notNull:true},
      cost: {type: 'int', notNull:true},
      description:{type: 'string', notNull:true},
      date: {type:'date', notNull:true},
      stock: {type:'int',notNull:true},
      
  })
};

exports.down = function(db) {
  return db.dropTable('products');
};

exports._meta = {
  "version": 1
};
