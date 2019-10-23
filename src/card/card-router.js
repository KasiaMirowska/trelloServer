const express = require('express')
const uuid = require('uuid/v4')
const logger = require('../logger');
const { cards, lists } = require('../store')

const cardRouter = express.Router()
const bodyParser = express.json()


cardRouter
    .route('/card')
    .get((req, res) => {
        res
        .json(cards);
    })
    .post(bodyParser, (req, res) => {
        const { title, content } = req.body;
        if(!title) {
            logger.error('title is required');
            return res.status(400).send('invalid data');
        }
        if(!content) {
            logger.error('content is required');
            return res.status(400).send('invalid data');
        }
        const id = uuid();
        const card = {
            id,
            title,
            content
        };
        cards.push(card);
        logger.info(`card with id ${id} created`);
        res
            .status(201)
            .location(`http://localhost:8000/card/${id}`)
            .json(card)
    })

cardRouter
    .route('/card/:id')
    .get((req, res) => {
        const { id } = req.params;
        const card = cards.find(c => c.id == id);

        if(!card) {
            logger.error(`Card with id ${id} not found`);
            return res.status(404).send('Card not found');
        };

        res.json(card);
    })
    .delete((req, res) => {
        const { id } = req.body;
        const cardIndex = cards.findIndex(card => cards.id !== id);

        if(cardIndex === -1) {
            logger.error(`Card with id ${id} not found`);
            return res.status(404).send('Not found');
        };

        lists.forEach(list => {
            const cardIds = list.cardIds.filter(cid => cid !== id);
            list.cardIds = cardIds;
        });

        cards.splice(cardIndex, 1);
        logger.info(`card with if ${id} deleted`);
        res.status(204).end();
  })

module.exports = cardRouter