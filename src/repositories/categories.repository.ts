import {inject} from '@loopback/core';
import {DefaultCrudRepository} from '@loopback/repository';
import {HaloDataSource} from '../datasources';
import {Categories, CategoriesRelations} from '../models';

export class CategoriesRepository extends DefaultCrudRepository<
  Categories,
  typeof Categories.prototype.id,
  CategoriesRelations
  > {
  constructor(
    @inject('datasources.Halo') dataSource: HaloDataSource,
  ) {
    super(Categories, dataSource);
  }
}
