from tensorflow.keras import models # to load model {model.load_model}
from tensorflow.keras.preprocessing import image
import numpy as np
import sys

import flask
from flask import request, jsonify

# label_class = ['Proliferative', 'Severe', 'Moderate','Mild','No DR']



def loadModel(model_path):
    global model
    model = models.load_model(model_path)

def predict(path):
    img = image.load_img(path, target_size=(224, 224))
    img = image.img_to_array(img)
    img = np.array([img])

    preds = model.predict(img)
    # print(preds.round()[0])
    pred = np.flip(preds.round()[0], axis=0)
    index = np.argmax(pred)
    return labels[index]

def shutdown_server():
    func = request.environ.get('werkzeug.server.shutdown')
    if func is None:
        raise RuntimeError('Not running with the Werkzeug Server')
    func()

app = flask.Flask(__name__)
app.config["DEBUG"] = True


labels = [4, 3, 2, 1, 0]

model_path = sys.argv[1]
loadModel(model_path)




@app.route('/', methods=['GET'])
def home():
    return '''<h1>Eye Care</h1><p>An API for classifing retinal images</p>'''



@app.route('/load_model', methods=["GET"])
def modelPath():
    if 'modelPath' in request.args:
        model_path = request.args['modelPath']
        loadModel(model_path)
        return jsonify('Model loaded')



@app.route("/classify", methods=["GET"])
def classify():
    if 'path' in request.args:
        path = request.args['path']
        class_label = predict(path)
        return jsonify(class_label)
    else:
        return 'Error, No path provided'
        


@app.route('/shutdown', methods=['GET'])
def shutdown():
    shutdown_server()
    return jsonify('Server shutting down...')



app.run(port=6723)
