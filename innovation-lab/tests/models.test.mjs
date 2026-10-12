import test from 'node:test';
import assert from 'node:assert/strict';
import {projects,acoustic,assemblyResult,planOrders,classifySamples,energyModel,incidents} from '../dist/models.mjs';
test('six unique projects and matching incident scenarios',()=>{assert.equal(new Set(projects.map(p=>p.id)).size,6);assert.equal(Object.keys(incidents).length,3);});
test('normal speed changes frequency without becoming a fault',()=>{assert.equal(acoustic('normal',2400).frequency,40);assert.ok(acoustic('normal',2400).score<40);assert.ok(acoustic('loose').score>40);});
test('assembly cannot complete with missing washer',()=>{const r=assemblyResult([0,1,3,4,5]);assert.equal(r.complete,false);assert.deepEqual(r.missing,['Colocar anilha']);assert.equal(assemblyResult([0,1,2,3,4,5]).complete,true);});
test('orders separate duplicate and ambiguity',()=>{const r=planOrders(true,true);assert.deepEqual(r.map(x=>x.status),['ready','review','ready','duplicate']);assert.equal(planOrders(false,false).filter(x=>x.status==='ready').length,3);});
test('unknowns request review; correction affects the next version',()=>{assert.equal(classifySamples(0,.8).at(-1).review,true);assert.equal(classifySamples(0,.8,{'V-04':'Suporte'}).at(-1).review,false);assert.ok(classifySamples(80,.8).filter(x=>x.review).length>classifySamples(0,.8).filter(x=>x.review).length);});
test('energy preserves active work and accounts for standby savings',()=>{const r=energyModel({hours:8,idle:4,tariff:.22,standby:true,production:100});assert.ok(Math.abs(r.saved-2.88)<1e-9);assert.ok(Math.abs(r.monthly-13.9392)<1e-9);assert.equal(energyModel({standby:false}).saved,0);assert.equal(energyModel({idle:0}).saved,0);assert.equal(r.activeHours,8);});
