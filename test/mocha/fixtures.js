/** not working yet **/
import {
    Human
} from '../../src/js/human/human.js';

import humanConfig from 'makehuman-data/public/data/resources.json'


import chai from 'chai'
import chaiBigNumber from 'chai-bignumber'
import chaiThings from 'chai-things'
import chaiAsPromised from 'chai-as-promised'
chai.use(chaiBigNumber)
chai.use(chaiThings)
chai.use(chaiAsPromised)
export const expect = chai.expect
export const assert = chai.assert
export const should = chai.should

humanConfig.baseUrl = '../node_modules/makehuman-data/public/data/'
export const config = humanConfig

export function loadHumanWithoutTargets(human) {
    human = new Human(config);
    // load human and check it worked
    return human.loadModel()
        .then((loadedHuman) => {
            const result = loadedHuman || human
            if (!result.mesh || !result.mesh.geometry || !result.mesh.geometry.vertices) {
                throw new Error('loadHumanWithoutTargets: mesh.geometry.vertices is missing after loadModel().')
            }
            return result
        })
}

/**
 * Fixture that loads a human with targets onto the input variable. Returns a promise
 * @param  {[type]} human [description]
 * @return {Promise}       a promise to load human onto the var human
 */
export function loadHumanWithTargets(human) {
    human = new Human(config)
    // load human and check it worked
    return human.loadModel()
        .then((loadedHuman) => {
            const result = loadedHuman || human
            return result.loadTargets().then(() => result)
        })
        .then((loadedHuman) => {
            if (!loadedHuman.targets || !loadedHuman.targets.children) {
                throw new Error('loadHumanWithTargets: targets.children is missing after loadTargets().')
            }
            return loadedHuman
        })
}
