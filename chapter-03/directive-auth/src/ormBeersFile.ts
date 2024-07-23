import { readFileSync, writeFileSync } from 'fs';
import path from 'path';

type Beer = {
  name: string;
  price: number;
  _id: string;
  createdAt: string;
};

const beerFilePath = path.join(process.cwd(), 'beers.json');
const beers: Array<Beer> = JSON.parse(readFileSync(beerFilePath, 'utf-8'));

export const BeerOrm = () => {
  const write = () => {
    writeFileSync(beerFilePath, JSON.stringify(beers));
  };
  const create = (beer: Pick<Beer, 'name' | 'price'>) => {
    const beerId = Math.random().toString(8);
    beers.push({
      _id: beerId,
      createdAt: new Date().toISOString(),
      ...beer,
    });
    write();
    return beerId;
  };
  const remove = (beer: Pick<Beer, '_id'>) => {
    const deletedIndex = beers.findIndex((b) => b._id === beer._id);
    beers.splice(deletedIndex, 1);
    write();
    return true;
  };
  const update = (_id: string, beer: Partial<Pick<Beer, 'name' | 'price'>>) => {
    const updatedIndex = beers.findIndex((b) => b._id === _id);
    beers[updatedIndex] = {
      ...beers[updatedIndex],
      ...beer,
    };
    return true;
  };
  const list = () => {
    return JSON.parse(readFileSync(beerFilePath, 'utf-8')) as Beer[];
  };
  return {
    create,
    update,
    remove,
    list,
  };
};
