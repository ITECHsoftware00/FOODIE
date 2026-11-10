import { test } from 'node:test';
import assert from 'node:assert/strict';
import { dishes, changeQuantity, totals, restoreState, filterDishes } from '../lib/foodie.ts';
test('basket computes exact pence and waives delivery at £30', () => {
  assert.deepEqual(totals({1:2}), {subtotal:2500,delivery:249,total:2749,count:2});
  assert.equal(totals({1:3}).delivery,0);
  assert.equal(totals({}).total,0);
});
test('quantity changes remove zero and cap at 20', () => {
  assert.deepEqual(changeQuantity({1:1},1,-1),{});
  assert.equal(changeQuantity({1:20},1,1)[1],20);
  assert.deepEqual(changeQuantity({},999,1),{});
});
test('invalid storage cannot corrupt checkout', () => {
  assert.deepEqual(restoreState('nope'),{basket:{},saved:[]});
  assert.deepEqual(restoreState(JSON.stringify({basket:{1:-5,2:2,3:0.5,999:4},saved:[1,1,999]})),{basket:{2:2},saved:[1]});
});
test('search and dietary filters combine and support no results', () => {
  assert.equal(filterDishes(dishes,'pizza','All',false).length,1);
  assert.equal(filterDishes(dishes,'','Burgers',true).length,0);
  assert.equal(filterDishes(dishes,'not-a-food','All',false).length,0);
});
