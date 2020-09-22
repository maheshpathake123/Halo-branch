import {DefaultCrudRepository} from '@loopback/repository';
import {UserAccount, UserAccountRelations} from '../models';
import {HaloDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserAccountRepository extends DefaultCrudRepository<
  UserAccount,
  typeof UserAccount.prototype.id,
  UserAccountRelations
> {
  constructor(
    @inject('datasources.Halo') dataSource: HaloDataSource,
  ) {
    super(UserAccount, dataSource);
  }
}
