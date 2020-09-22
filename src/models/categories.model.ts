import {Entity, model, property} from '@loopback/repository';

@model()
export class Categories extends Entity {
  @property({
    type: 'string',
    id: true,

  })
  id?: string;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',

  })
  image: string;

  @property({
    type: 'string',

  })
  parentCategoryId: string;

  @property({
    type: 'number',
    required: true,
    postgresql: {
      dataType: "bigint"
    }
  })
  createdAt: number;

  @property({
    type: 'boolean',
    required: true,

  })
  isActive: boolean;



  constructor(data?: Partial<Categories>) {
    super(data);
  }
}

export interface CategoriesRelations {
  // describe navigational properties here
}

export type CategoriesWithRelations = Categories & CategoriesRelations;
