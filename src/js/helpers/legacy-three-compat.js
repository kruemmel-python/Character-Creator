import {
    BufferAttribute,
    BufferGeometry,
    Color,
    FileLoader,
    Float32BufferAttribute,
    LoaderUtils,
    MeshPhongMaterial,
    TextureLoader,
    Vector2,
    Vector3,
    Vector4
} from 'three'
import { Face3, Geometry as LegacyGeometry } from 'three-stdlib-geometry'


function isBitSet(value, position) {
    return value & (1 << position)
}

function parseModel(json, geometry) {
    let i
    let j
    let fi
    let offset
    let zLength

    let colorIndex
    let normalIndex
    let uvIndex
    let materialIndex

    let type
    let isQuad
    let hasMaterial
    let hasFaceVertexUv
    let hasFaceNormal
    let hasFaceVertexNormal
    let hasFaceColor
    let hasFaceVertexColor

    let face
    let faceA
    let faceB
    let hex
    let normal

    let uvLayer
    let uv
    let u
    let v

    const faces = json.faces || []
    const vertices = json.vertices || []
    const normals = json.normals || []
    const colors = json.colors || []
    const scale = json.scale || 1

    let nUvLayers = 0

    if (json.uvs !== undefined) {
        for (i = 0; i < json.uvs.length; i++) {
            if (json.uvs[i].length) nUvLayers++
        }

        for (i = 0; i < nUvLayers; i++) {
            geometry.faceVertexUvs[i] = []
        }
    }

    offset = 0
    zLength = vertices.length

    while (offset < zLength) {
        const vertex = new Vector3()
        vertex.x = vertices[offset++] * scale
        vertex.y = vertices[offset++] * scale
        vertex.z = vertices[offset++] * scale
        geometry.vertices.push(vertex)
    }

    offset = 0
    zLength = faces.length

    while (offset < zLength) {
        type = faces[offset++]

        isQuad = isBitSet(type, 0)
        hasMaterial = isBitSet(type, 1)
        hasFaceVertexUv = isBitSet(type, 3)
        hasFaceNormal = isBitSet(type, 4)
        hasFaceVertexNormal = isBitSet(type, 5)
        hasFaceColor = isBitSet(type, 6)
        hasFaceVertexColor = isBitSet(type, 7)

        if (isQuad) {
            faceA = new Face3()
            faceA.a = faces[offset]
            faceA.b = faces[offset + 1]
            faceA.c = faces[offset + 3]

            faceB = new Face3()
            faceB.a = faces[offset + 1]
            faceB.b = faces[offset + 2]
            faceB.c = faces[offset + 3]

            offset += 4

            if (hasMaterial) {
                materialIndex = faces[offset++]
                faceA.materialIndex = materialIndex
                faceB.materialIndex = materialIndex
            }

            fi = geometry.faces.length

            if (hasFaceVertexUv) {
                for (i = 0; i < nUvLayers; i++) {
                    uvLayer = json.uvs[i]
                    geometry.faceVertexUvs[i][fi] = []
                    geometry.faceVertexUvs[i][fi + 1] = []

                    for (j = 0; j < 4; j++) {
                        uvIndex = faces[offset++]
                        u = uvLayer[uvIndex * 2]
                        v = uvLayer[uvIndex * 2 + 1]
                        uv = new Vector2(u, v)

                        if (j !== 2) geometry.faceVertexUvs[i][fi].push(uv)
                        if (j !== 0) geometry.faceVertexUvs[i][fi + 1].push(uv)
                    }
                }
            }

            if (hasFaceNormal) {
                normalIndex = faces[offset++] * 3

                faceA.normal.set(
                    normals[normalIndex++],
                    normals[normalIndex++],
                    normals[normalIndex]
                )
                faceB.normal.copy(faceA.normal)
            }

            if (hasFaceVertexNormal) {
                for (i = 0; i < 4; i++) {
                    normalIndex = faces[offset++] * 3
                    normal = new Vector3(
                        normals[normalIndex++],
                        normals[normalIndex++],
                        normals[normalIndex]
                    )

                    if (i !== 2) faceA.vertexNormals.push(normal)
                    if (i !== 0) faceB.vertexNormals.push(normal)
                }
            }

            if (hasFaceColor) {
                colorIndex = faces[offset++]
                hex = colors[colorIndex]
                faceA.color.setHex(hex)
                faceB.color.setHex(hex)
            }

            if (hasFaceVertexColor) {
                for (i = 0; i < 4; i++) {
                    colorIndex = faces[offset++]
                    hex = colors[colorIndex]

                    if (i !== 2) faceA.vertexColors.push(new Color(hex))
                    if (i !== 0) faceB.vertexColors.push(new Color(hex))
                }
            }

            geometry.faces.push(faceA)
            geometry.faces.push(faceB)
        } else {
            face = new Face3()
            face.a = faces[offset++]
            face.b = faces[offset++]
            face.c = faces[offset++]

            if (hasMaterial) {
                materialIndex = faces[offset++]
                face.materialIndex = materialIndex
            }

            fi = geometry.faces.length

            if (hasFaceVertexUv) {
                for (i = 0; i < nUvLayers; i++) {
                    uvLayer = json.uvs[i]
                    geometry.faceVertexUvs[i][fi] = []

                    for (j = 0; j < 3; j++) {
                        uvIndex = faces[offset++]
                        u = uvLayer[uvIndex * 2]
                        v = uvLayer[uvIndex * 2 + 1]
                        uv = new Vector2(u, v)
                        geometry.faceVertexUvs[i][fi].push(uv)
                    }
                }
            }

            if (hasFaceNormal) {
                normalIndex = faces[offset++] * 3
                face.normal.set(
                    normals[normalIndex++],
                    normals[normalIndex++],
                    normals[normalIndex]
                )
            }

            if (hasFaceVertexNormal) {
                for (i = 0; i < 3; i++) {
                    normalIndex = faces[offset++] * 3
                    normal = new Vector3(
                        normals[normalIndex++],
                        normals[normalIndex++],
                        normals[normalIndex]
                    )
                    face.vertexNormals.push(normal)
                }
            }

            if (hasFaceColor) {
                colorIndex = faces[offset++]
                face.color.setHex(colors[colorIndex])
            }

            if (hasFaceVertexColor) {
                for (i = 0; i < 3; i++) {
                    colorIndex = faces[offset++]
                    face.vertexColors.push(new Color(colors[colorIndex]))
                }
            }

            geometry.faces.push(face)
        }
    }
}

function parseSkin(json, geometry) {
    const influencesPerVertex = json.influencesPerVertex !== undefined ? json.influencesPerVertex : 2

    if (json.skinWeights) {
        for (let i = 0, l = json.skinWeights.length; i < l; i += influencesPerVertex) {
            const x = json.skinWeights[i]
            const y = influencesPerVertex > 1 ? json.skinWeights[i + 1] : 0
            const z = influencesPerVertex > 2 ? json.skinWeights[i + 2] : 0
            const w = influencesPerVertex > 3 ? json.skinWeights[i + 3] : 0
            geometry.skinWeights.push(new Vector4(x, y, z, w))
        }
    }

    if (json.skinIndices) {
        for (let i = 0, l = json.skinIndices.length; i < l; i += influencesPerVertex) {
            const a = json.skinIndices[i]
            const b = influencesPerVertex > 1 ? json.skinIndices[i + 1] : 0
            const c = influencesPerVertex > 2 ? json.skinIndices[i + 2] : 0
            const d = influencesPerVertex > 3 ? json.skinIndices[i + 3] : 0
            geometry.skinIndices.push(new Vector4(a, b, c, d))
        }
    }

    geometry.bones = json.bones
}

function parseMorphing(json, geometry) {
    const scale = json.scale || 1

    if (json.morphTargets !== undefined) {
        for (let i = 0, l = json.morphTargets.length; i < l; i++) {
            geometry.morphTargets[i] = {}
            geometry.morphTargets[i].name = json.morphTargets[i].name
            geometry.morphTargets[i].vertices = []

            const dstVertices = geometry.morphTargets[i].vertices
            const srcVertices = json.morphTargets[i].vertices

            for (let v = 0, vl = srcVertices.length; v < vl; v += 3) {
                const vertex = new Vector3()
                vertex.x = srcVertices[v] * scale
                vertex.y = srcVertices[v + 1] * scale
                vertex.z = srcVertices[v + 2] * scale
                dstVertices.push(vertex)
            }
        }
    }

    if (json.morphColors !== undefined && json.morphColors.length > 0) {
        const faces = geometry.faces
        const morphColors = json.morphColors[0].colors

        for (let i = 0, l = faces.length; i < l; i++) {
            faces[i].color.fromArray(morphColors, i * 3)
        }
    }
}

function toAbsolutePath(path, texturePath) {
    if (!path) return path
    if (/^(https?:)?\/\//i.test(path)) return path
    if (path.startsWith('data:')) return path
    if (!texturePath) return path
    return `${texturePath}${path}`.replace(/\\/g, '/')
}

function applyLegacyMaterialProps(material, jsonMaterial) {
    if (!jsonMaterial) return material

    if (jsonMaterial.DbgName) material.name = jsonMaterial.DbgName
    if (jsonMaterial.name) material.name = jsonMaterial.name

    if (Array.isArray(jsonMaterial.colorDiffuse)) material.color.fromArray(jsonMaterial.colorDiffuse)
    if (Array.isArray(jsonMaterial.colorSpecular)) material.specular.fromArray(jsonMaterial.colorSpecular)
    if (Array.isArray(jsonMaterial.colorEmissive)) material.emissive.fromArray(jsonMaterial.colorEmissive)

    if (jsonMaterial.specularCoef !== undefined) material.shininess = Number(jsonMaterial.specularCoef) * 100
    if (jsonMaterial.opacity !== undefined) material.opacity = Number(jsonMaterial.opacity)
    if (jsonMaterial.transparent !== undefined) material.transparent = Boolean(jsonMaterial.transparent)
    if (jsonMaterial.wireframe !== undefined) material.wireframe = Boolean(jsonMaterial.wireframe)

    if (material.opacity < 1) material.transparent = true

    return material
}

function loadOptionalTexture(textureLoader, texturePath, textureFile) {
    if (!textureFile) return null
    const resolved = toAbsolutePath(textureFile, texturePath)
    return textureLoader.load(resolved)
}

function buildMaterials(jsonMaterials, texturePath) {
    if (!Array.isArray(jsonMaterials) || jsonMaterials.length === 0) {
        return []
    }

    const textureLoader = new TextureLoader()

    return jsonMaterials.map((jsonMaterial, i) => {
        const material = applyLegacyMaterialProps(new MeshPhongMaterial(), jsonMaterial)
        if (!material.name) material.name = `material_${i}`

        const map = loadOptionalTexture(textureLoader, texturePath, jsonMaterial.mapDiffuse)
        if (map) material.map = map

        const alphaMap = loadOptionalTexture(textureLoader, texturePath, jsonMaterial.mapAlpha)
        if (alphaMap) {
            material.alphaMap = alphaMap
            material.transparent = true
        }

        const bumpMap = loadOptionalTexture(textureLoader, texturePath, jsonMaterial.mapBump)
        if (bumpMap) material.bumpMap = bumpMap

        const normalMap = loadOptionalTexture(textureLoader, texturePath, jsonMaterial.mapNormal)
        if (normalMap) material.normalMap = normalMap

        const specularMap = loadOptionalTexture(textureLoader, texturePath, jsonMaterial.mapSpecular)
        if (specularMap) material.specularMap = specularMap

        material.skinning = true
        material.morphTargets = true
        return material
    })
}

function ensureMaterialArray(materials) {
    const materialArray = Array.isArray(materials) ? materials : [materials]
    materialArray.materials = materialArray
    return materialArray
}

function defineLegacyAlias(bufferGeometry, legacyGeometry, key) {
    Object.defineProperty(bufferGeometry, key, {
        configurable: true,
        enumerable: false,
        get() {
            return legacyGeometry[key]
        },
        set(value) {
            legacyGeometry[key] = value
        }
    })
}

export function extractUrlBase(url) {
    return LoaderUtils.extractUrlBase(url)
}

export function createLegacyMaterial(jsonMaterial, texturePath = '') {
    const material = applyLegacyMaterialProps(new MeshPhongMaterial(), jsonMaterial || {})
    const textureLoader = new TextureLoader()

    const map = loadOptionalTexture(textureLoader, texturePath, jsonMaterial && jsonMaterial.mapDiffuse)
    if (map) material.map = map

    const alphaMap = loadOptionalTexture(textureLoader, texturePath, jsonMaterial && jsonMaterial.mapAlpha)
    if (alphaMap) {
        material.alphaMap = alphaMap
        material.transparent = true
    }

    const bumpMap = loadOptionalTexture(textureLoader, texturePath, jsonMaterial && jsonMaterial.mapBump)
    if (bumpMap) material.bumpMap = bumpMap

    const normalMap = loadOptionalTexture(textureLoader, texturePath, jsonMaterial && jsonMaterial.mapNormal)
    if (normalMap) material.normalMap = normalMap

    const specularMap = loadOptionalTexture(textureLoader, texturePath, jsonMaterial && jsonMaterial.mapSpecular)
    if (specularMap) material.specularMap = specularMap

    material.skinning = true
    material.morphTargets = true
    return material
}

export function parseLegacyModel(json, texturePath = '') {
    if (json && json.data !== undefined) {
        json = json.data
    }

    if (!json) {
        return { legacyGeometry: new LegacyGeometry(), materials: [] }
    }

    json.scale = json.scale !== undefined ? 1.0 / json.scale : 1.0

    const legacyGeometry = new LegacyGeometry()
    parseModel(json, legacyGeometry)
    parseSkin(json, legacyGeometry)
    parseMorphing(json, legacyGeometry)

    legacyGeometry.computeFaceNormals()
    legacyGeometry.computeBoundingSphere()

    const materials = buildMaterials(json.materials, texturePath)
    return { legacyGeometry, materials }
}

export function attachLegacyGeometry(bufferGeometry, legacyGeometry) {
    bufferGeometry._legacyGeometry = legacyGeometry
    bufferGeometry._bufferGeometry = bufferGeometry

    defineLegacyAlias(bufferGeometry, legacyGeometry, 'vertices')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'faces')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'faceVertexUvs')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'morphTargets')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'skinWeights')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'skinIndices')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'lineDistances')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'elementsNeedUpdate')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'verticesNeedUpdate')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'uvsNeedUpdate')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'normalsNeedUpdate')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'colorsNeedUpdate')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'lineDistancesNeedUpdate')
    defineLegacyAlias(bufferGeometry, legacyGeometry, 'groupsNeedUpdate')

    return bufferGeometry
}

function ensurePositionAttribute(bufferGeometry, vertexCount) {
    let position = bufferGeometry.getAttribute('position')
    if (!position || position.count !== vertexCount) {
        position = new Float32BufferAttribute(vertexCount * 3, 3)
        bufferGeometry.setAttribute('position', position)
    }
    return position
}

function ensureUvAttribute(bufferGeometry, uvCount) {
    let uv = bufferGeometry.getAttribute('uv')
    if (!uv || uv.count !== uvCount) {
        uv = new Float32BufferAttribute(uvCount * 2, 2)
        bufferGeometry.setAttribute('uv', uv)
    }
    return uv
}

function ensureIndexAttribute(bufferGeometry, vertexCount, indexCount) {
    const use32Bit = vertexCount > 65535
    const indexCtor = use32Bit ? Uint32Array : Uint16Array
    let index = bufferGeometry.getIndex()

    if (!index || index.count !== indexCount || !(index.array instanceof indexCtor)) {
        index = new BufferAttribute(new indexCtor(indexCount), 1)
        bufferGeometry.setIndex(index)
    }

    return index
}

function syncSkinData(bufferGeometry, legacyGeometry) {
    if (!legacyGeometry.skinWeights || legacyGeometry.skinWeights.length === 0) return

    const skinWeights = new Float32Array(legacyGeometry.skinWeights.length * 4)
    const skinIndices = new Float32Array(legacyGeometry.skinIndices.length * 4)

    for (let i = 0; i < legacyGeometry.skinWeights.length; i++) {
        const w = legacyGeometry.skinWeights[i]
        const idx = legacyGeometry.skinIndices[i]

        skinWeights[i * 4] = w.x
        skinWeights[i * 4 + 1] = w.y
        skinWeights[i * 4 + 2] = w.z
        skinWeights[i * 4 + 3] = w.w

        skinIndices[i * 4] = idx.x
        skinIndices[i * 4 + 1] = idx.y
        skinIndices[i * 4 + 2] = idx.z
        skinIndices[i * 4 + 3] = idx.w
    }

    bufferGeometry.setAttribute('skinWeight', new Float32BufferAttribute(skinWeights, 4))
    bufferGeometry.setAttribute('skinIndex', new Float32BufferAttribute(skinIndices, 4))
}

export function syncLegacyGeometry(bufferGeometry) {
    const legacyGeometry = bufferGeometry && bufferGeometry._legacyGeometry
    if (!legacyGeometry) return bufferGeometry

    const vertices = legacyGeometry.vertices || []
    const faces = legacyGeometry.faces || []
    const uvs = (legacyGeometry.faceVertexUvs && legacyGeometry.faceVertexUvs[0]) || []

    const position = ensurePositionAttribute(bufferGeometry, vertices.length)
    for (let i = 0; i < vertices.length; i++) {
        const v = vertices[i]
        position.setXYZ(i, v.x, v.y, v.z)
    }
    position.needsUpdate = true

    if (faces.length > 0) {
        const index = ensureIndexAttribute(bufferGeometry, vertices.length, faces.length * 3)

        for (let i = 0; i < faces.length; i++) {
            const face = faces[i]
            index.setX(i * 3, face.a)
            index.setX(i * 3 + 1, face.b)
            index.setX(i * 3 + 2, face.c)
        }
        index.needsUpdate = true

        bufferGeometry.clearGroups()

        let groupStart = 0
        let currentMaterial = faces[0].materialIndex || 0
        for (let i = 1; i < faces.length; i++) {
            const materialIndex = faces[i].materialIndex || 0
            if (materialIndex !== currentMaterial) {
                bufferGeometry.addGroup(groupStart * 3, (i - groupStart) * 3, currentMaterial)
                groupStart = i
                currentMaterial = materialIndex
            }
        }
        bufferGeometry.addGroup(groupStart * 3, (faces.length - groupStart) * 3, currentMaterial)
    }

    if (uvs.length === faces.length && faces.length > 0) {
        const uv = ensureUvAttribute(bufferGeometry, faces.length * 3)
        for (let i = 0; i < faces.length; i++) {
            const triUvs = uvs[i]
            if (!triUvs || triUvs.length < 3) continue
            uv.setXY(i * 3, triUvs[0].x, triUvs[0].y)
            uv.setXY(i * 3 + 1, triUvs[1].x, triUvs[1].y)
            uv.setXY(i * 3 + 2, triUvs[2].x, triUvs[2].y)
        }
        uv.needsUpdate = true
    }

    syncSkinData(bufferGeometry, legacyGeometry)

    bufferGeometry.computeVertexNormals()
    bufferGeometry.computeBoundingBox()
    bufferGeometry.computeBoundingSphere()
    legacyGeometry.boundingBox = bufferGeometry.boundingBox ? bufferGeometry.boundingBox.clone() : null
    legacyGeometry.boundingSphere = bufferGeometry.boundingSphere ? bufferGeometry.boundingSphere.clone() : null
    return bufferGeometry
}

export function legacyToBufferGeometry(legacyGeometry) {
    const bufferGeometry = new BufferGeometry()
    attachLegacyGeometry(bufferGeometry, legacyGeometry)
    syncLegacyGeometry(bufferGeometry)
    return bufferGeometry
}

export function createMaterialArray(materials) {
    return ensureMaterialArray(materials)
}

export function loadTextFile(url, manager) {
    const loader = new FileLoader(manager)
    return new Promise((resolve, reject) => {
        loader.load(url, resolve, undefined, reject)
    })
}
