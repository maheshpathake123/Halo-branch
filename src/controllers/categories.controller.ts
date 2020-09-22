import {inject} from '@loopback/context';
import {


  repository
} from '@loopback/repository';
import {
  del, get,
  getModelSchemaRef, param,
  patch, post,
  put,
  requestBody, Response, RestBindings
} from '@loopback/rest';
import {Categories} from '../models';
import {CategoriesRepository} from '../repositories';
const uuidv4 = require('uuid-v4');
const expiresIn = '1d';
const config = require('../config/config').config;


export class CategoriesController {
  constructor(
    @repository(CategoriesRepository)
    public categoriesRepository: CategoriesRepository,
  ) {}


  //add category
  @post('/addcategory')
  async signUp(@requestBody() body: any,
    @inject(RestBindings.Http.RESPONSE) response: Response): Promise<any> {
    try {

      var obj = {
        id: uuidv4(),
        name: body.name,
        image: body.image,
        parentCategoryId: body.parentCategoryId,

        createdAt: Date.now(),

        isActive: true

      }

      let savedCategory = await this.categoriesRepository.create(obj);

      return response.status(200).json({message: "Successfully created Category"})
    }
    catch (err) {
      return response.status(500).json({message: err.message});
    }


  }

  //display category by name
  @get('/category/subcategory')
  async getProfile(@param.query.string('parentCategoryId') parentCategoryId: string,
    @inject(RestBindings.Http.RESPONSE) response: Response): Promise<any> {
    try {

      let category = await this.categoriesRepository.find({where: {parentCategoryId: parentCategoryId}});
      //let category: any = await this.categoriesRepository.find({where: {parentCategoryId: id, accountVerified: true}});

      return response.status(200).json({category})
    } catch (err) {
      return response.status(500).json({message: err.message});
    }
  }









  @patch('/categories/{id}', {
    responses: {
      '204': {
        description: 'Categories PATCH success',
      },
    },
  })
  async updateById(
    @param.path.string('id') id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Categories, {partial: true}),
        },
      },
    })
    categories: Categories,
  ): Promise<void> {
    await this.categoriesRepository.updateById(id, categories);
  }

  @put('/categories/{id}', {
    responses: {
      '204': {
        description: 'Categories PUT success',
      },
    },
  })
  async replaceById(
    @param.path.string('id') id: string,
    @requestBody() categories: Categories,
  ): Promise<void> {
    await this.categoriesRepository.replaceById(id, categories);
  }

  @del('/categories/{id}', {
    responses: {
      '204': {
        description: 'Categories DELETE success',
      },
    },
  })
  async deleteById(@param.path.string('id') id: string): Promise<void> {
    await this.categoriesRepository.deleteById(id);
  }
}
