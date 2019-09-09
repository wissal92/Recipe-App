import axios from 'axios';
import {key, proxi} from '../config';

export default class Search{
    constructor(query){
      this.query = query;
    }

    async getResult(){
        try {
        const res = await axios(`${proxi}https://www.food2fork.com/api/search?key=${key}&q=${this.query}`)
        this.result = res.data.recipes
        //console.log(this.result)
        } catch(error){
            console.log(error)
        }
     }
};