from rest_framework.views import APIView
from rest_framework.response import Response
from django.http import JsonResponse, HttpRequest
from rest_framework.request import Request
from django.http import HttpResponse
from config.settings.base import STATIC_ROOT, ROOT_DIR, STATICFILES_DIRS
from django.shortcuts import render

import numpy as np
from numpy import dtype
import pandas as pd

import skimage
from sklearn.multiclass import OneVsRestClassifier
from sklearn.metrics import roc_auc_score
from sklearn import tree
from sklearn.linear_model import LinearRegression as lr
from sklearn.linear_model import LogisticRegression as lgr
from skimage.measure import EllipseModel
import statsmodels.api as sm

from scipy import stats
import os, json, math

# DATA_FILE_PATH = './data/data_misinformation.csv'
# DTYPE_FILE_PATH = './data/data_misinformation.json'

# DATA_FILE_PATH = './data/data_exam.csv'
# DTYPE_FILE_PATH = './data/data_exam.json'

# DATA_FILE_PATH = './data/data_job.csv'
# DTYPE_FILE_PATH = './data/data_job.json'

# DATA_FILE_PATH = './data/data_college.csv'
# DTYPE_FILE_PATH = './data/data_college.json'

# DATA_FILE_PATH = './data/debunk_simulated_data.csv' # disc simulated
# DTYPE_FILE_PATH = './data/debunk_simulated_data_dtypes.json'

# DATA_FILE_PATH = './data/disc_sp_data.csv' # disc simulated
# DTYPE_FILE_PATH = './data/disc_sp_data_dtypes.json'

DATA_FILE_PATH = './data/dataset.csv' # lalonde data
DTYPE_FILE_PATH = './data/dataset_dtypes.json' # lalonde data

# DATA_FILE_PATH = './data/simulated_continuous_simpson_paradox.csv'
# DTYPE_FILE_PATH = './data/simulated_continuous_simpson_paradox.json'

# DATA_FILE_PATH = './data/khan_smallscale_data.csv'
# DTYPE_FILE_PATH = './data/khan_smallscale_dtypes.json'

# DATA_FILE_PATH = './data/Kamil_data4.csv'
# DTYPE_FILE_PATH = './data/Kamil_data4.json'


###################################
#####   LOAD DATA & FEATURES  #####
###################################

def _open_dataset(file_path, dtype_path):
    with open(os.path.join(STATICFILES_DIRS[0], dtype_path)) as f:
        dtype = json.load(f)
    whole_dataset_df = pd.read_csv(
        open(os.path.join(STATICFILES_DIRS[0], file_path), 'rU'), 
        dtype = dtype)
    # print(whole_dataset_df)
    return whole_dataset_df

class LoadFile(APIView):
    def get(self, request, format=None):
        whole_dataset_df = _open_dataset(DATA_FILE_PATH, DTYPE_FILE_PATH)
        
        return Response(whole_dataset_df.to_json(orient='records'))

class ExtractFeatures(APIView):
    def get(self, request, format=None):
        whole_dataset_df = _open_dataset(DATA_FILE_PATH, DTYPE_FILE_PATH)
        dtypes = whole_dataset_df.dtypes

        feature_info_list = []
        for col in whole_dataset_df.columns:
            if dtypes[col] == 'object':
                feature_info_list.append({
                    "name": col,
                    "type": "categorical",
                    "label": sorted(list(whole_dataset_df[col].unique())) 
                })
            else:
                feature_info_list.append({
                    "name": col,
                    "type": "continuous",
                    "range": [min(whole_dataset_df[col]), max(whole_dataset_df[col])],
                    "cutPoint": float(np.median(whole_dataset_df[col]))
                })

        return Response({
            'features': feature_info_list,
            'selectedFeatures': {
                'cause': '',
                'outcome': '',
                'covariates': []
            }
        })

###################################
####      IMBALANCE SCORE       ###
###################################

def _calImbalanceScore(x, y, Z, groupIDs, feasibleGroupIndices):

    def _getX(df, zcol, xcol):
        if df[zcol].dtype == object:
            X = pd.concat([df[xcol], pd.get_dummies(df[zcol])], axis=1)
        else:
            X = df[[xcol,zcol]]
        return X
    
    def _getCBS(df, ycol, xcol, zcol):
        X = df[[xcol]]
        y = df[ycol]
        if df[ycol].dtype == object:
            lr1 = lgr().fit(X = X, y = y)
            lr2 = lgr().fit(X = _getX(df, zcol, xcol), y = y)
            return abs((lr2.coef_[0][0] - lr1.coef_[0][0]) / lr1.coef_[0][0])
        else:
            lr1 = lr().fit(X = X, y = y)
            lr2 = lr().fit(X = _getX(df, zcol, xcol), y = y)
            return abs((lr2.coef_[0] - lr1.coef_[0]) / lr1.coef_[0])

    df = _open_dataset(DATA_FILE_PATH, DTYPE_FILE_PATH)
    # rescale continuous columns
    for c in df.columns:
        if df[c].dtype == float:
            df[c] = (df[c] - df[c].min()) / (df[c].max() - df[c].min())
    xcol = x
    ycol = y
    zcols = Z if len(Z) > 0 else [c for c in df.columns if c != xcol and c != ycol]
    if len(groupIDs) == 0:
        cbs = []
        for zcol in zcols:
            score = _getCBS(df, ycol, xcol, zcol)
            cbs.append({
                    'groupIndex': 'P',
                    'varName': zcol,
                    'score': score
            })
    else:
        cbs = []
        df['GroupID'] = groupIDs
        for g in feasibleGroupIndices:
            df1 = df[df['GroupID'] == g]
            for zcol in zcols:
                score = _getCBS(df1, ycol, xcol, zcol)
                cbs.append({
                    'groupIndex': g,
                    'varName': zcol,
                    'score': score
                })
    return cbs


class CalImbalanceScore(APIView):
    def get(self, request, format=None):
        pass

    def post(self, request, format=None):
        parsed_request = json.loads(request.body.decode(encoding='UTF-8'))
        x, y, Z, groupIDs, feasibleGroupIndices = \
            parsed_request['x'], parsed_request['y'], parsed_request['Z'], \
                parsed_request['groupIDs'], parsed_request['feasibleGroupIndices']
        
        imbScores = _calImbalanceScore(x, y, Z, groupIDs, feasibleGroupIndices)

        # return Response({'imbScores': json.dumps(imbScores)})
        return Response(imbScores)

###################################
####      BALANCE TABLE       #####
###################################
# come soon if needed!!!


###################################
####      ELLIPSE PARAMS       ####
###################################
class CalEllipseParams(APIView):
    def get(self, request, format=None):
        pass

    def post(self, request, format=None):
        data = _open_dataset(DATA_FILE_PATH, DTYPE_FILE_PATH)
        req = json.loads(request.body.decode(encoding='UTF-8'))
        causeVarName, outcomeVarName, GroupIDList = \
            req['causeVarName'], req['outcomeVarName'], req['GroupIDList']

        ellipse = EllipseModel()
        params = []
        
        if len(GroupIDList) == 0:
            xy = data[[causeVarName, outcomeVarName]].values
            if ellipse.estimate(xy):
                xc, yc, a, b, theta = ellipse.params
                params.append({
                    'groupIndex': 0,
                    'xc': float(xc), 
                    'yc': float(yc), 
                    'a': float(a), 
                    'b': float(b), 
                    'theta': float(theta)
                })
        else:
            data['group'] = GroupIDList
            IDs = data['group'].unique()
            for G in IDs:
                xy = data[data['group'] == G][[causeVarName, outcomeVarName]].values
                if ellipse.estimate(xy):
                    xc, yc, a, b, theta = ellipse.params
                    params.append({
                        'groupIndex': int(G),
                        'xc': float(xc), 
                        'yc': float(yc), 
                        'a': float(a), 
                        'b': float(b), 
                        'theta': float(theta)
                    })
        return Response({
            "ellipseParams": params
        })

##############################################
### REGRESSION ANALYSIS FOR FEASIBLE GROUP ###
##############################################

# def _feasible(X, causeVarType):
#     if causeVarType == 'continuous':
#         if np.std(X) < 0.01:
#             return False
#     if causeVarType == 'categorical':
#         p = np.sum(X) / len(X)
#         if p == 0 or p == 1.0:
#             return False
#     return True

def _calRegression(X, y, model):

    X = sm.add_constant(X)
    names = X.columns
    if model not in ["OLS","Logit"]:
        raise("Invalid model type.")
        return None
    else:
        if model == "OLS":
            mod = sm.OLS(y, X).fit(disp=False)
            # print(mod.summary())
        if model == "Logit":
            mod = sm.Logit(y, X).fit(disp=False)
            # print(mod.summary())
        return {"coef": mod.params.to_dict()[names[1]],
                "std_err": mod.bse.to_dict()[names[1]],
                "conf_int": [x[names[1]] for x in mod.conf_int().to_dict().values()],
                "pvalue": mod.pvalues.to_dict()[names[1]],
                "nobs": mod.nobs}


class CalRegression(APIView):
    def get(self, request, format=None):
        pass
    def post(self, request, format=None):
        df = _open_dataset(DATA_FILE_PATH, DTYPE_FILE_PATH)
        parsed_request = json.loads(request.body.decode(encoding='UTF-8'))
    
        causeVarName, \
        outcomeVarName, outcomeVarType = \
            parsed_request['causeVarName'], \
            parsed_request['outcomeVarName'], parsed_request['outcomeVarType']
        GroupIDList = parsed_request['GroupIDList']
        feasibleGroupIndices = parsed_request['feasibleGroupIndices']
        
        model = 'Logit' if outcomeVarType == "categorical" else "OLS"
        
        result = []
        if len(GroupIDList) == 0:
            X = df[causeVarName].astype(float)
            y = df[outcomeVarName].astype(float)
            presult = _calRegression(X, y, model)
            if presult:
                presult['groupIndex'] = 0
                result.append(presult)
        else:
            df['GroupID'] = GroupIDList
            for g in feasibleGroupIndices:
                X = df[df['GroupID'] == g][causeVarName].astype(float)
                y = df[df['GroupID'] == g][outcomeVarName].astype(float)
                gresult = _calRegression(X, y, model)
                if gresult:
                    gresult['groupIndex'] = g
                    result.append(gresult)
        return Response(result)

##################################################
###         COVARIATE DISCRIMINABILITY         ###
##################################################

def _discByRegression(df, causeVarName, outcomeVarName, groupIDList):
    disc = []
    y = groupIDList
    
    df = df[[col for col in df.columns \
             if col not in [causeVarName, outcomeVarName]]]
    
    df_dummy = pd.get_dummies(df[df.columns])
    columns = df_dummy.columns
    
    for col in columns:
        X = df_dummy[[col]].values
        y_pred = OneVsRestClassifier(
            lgr(solver="liblinear", random_state=0)).fit(X, y).predict_proba(X)

        auc = roc_auc_score(y, y_pred[:,1]) if len(set(groupIDList)) == 2 \
            else roc_auc_score(y, y_pred, average = 'weighted', multi_class = 'ovr')
        
        disc.append({
            'varName': col, 'disc': auc
        })
    return disc

class CalDiscByRegression(APIView):
    def get(self, request, format=None):
        pass
    def post(self, request, format=None):
        df = _open_dataset(DATA_FILE_PATH, DTYPE_FILE_PATH)
        parsed_request = json.loads(request.body.decode(encoding='UTF-8'))
        causeVarName, outcomeVarName, GroupIDList = parsed_request['causeVarName'], \
            parsed_request['outcomeVarName'], parsed_request['GroupIDList']
        
        disc = _discByRegression(df, causeVarName, outcomeVarName, GroupIDList)
        return Response(disc)

##################################################
###         AUTO PARTITION & EVALUATION         ##
##################################################

def _extract_tree_terminal_names(clf, names):
    children_left = clf.tree_.children_left
    children_right = clf.tree_.children_right
    feature = clf.tree_.feature
    threshold = clf.tree_.threshold
    stack = [(0, '')]  # start with the root node id (0) and its depth (0)
    node_names = []

    while len(stack) > 0:
        node_id, name = stack.pop()

        # If the left and right child of a node is not the same we have a split
        is_split_node = children_left[node_id] != children_right[node_id]
        f, thr = feature[node_id], threshold[node_id]
        # If a split node, append left and right children and depth to `stack`
        # so we can loop through them
        if is_split_node:
            stack.append((children_left[node_id],
                name + '; ' + names[f] + ' <= ' + str(round(thr, 2)) ))
            stack.append((children_right[node_id],
                name + '; ' + names[f] + ' > ' + str(round(thr, 2)) ))
        else:
            node_names.append([node_id, name])
    return node_names

class AutoPartition(APIView):
    def get(self, request, format = None):
        pass

    def post(self, request, format = None):
        parsed_request = json.loads(request.body.decode(encoding='UTF-8'))
        # print('=======', parsed_request)

        xVar, xType, zVars = parsed_request['causeVarName'], \
            parsed_request['causeVarType'], parsed_request['covariates']
        ngroups, minSamples = parsed_request['ngroups'], parsed_request['minSamples']
        
        
        df = _open_dataset(DATA_FILE_PATH, DTYPE_FILE_PATH)
        n = df.shape[0]
        size = math.floor(n / ngroups)
        min_samples_leaf = math.floor(size * 0.8) if minSamples < 0 else minSamples

        df_dummies = pd.get_dummies(df[zVars], drop_first=True)
        zVars = df_dummies.columns
        X, y = df_dummies[zVars].values, df[xVar]

        if xType == 'continuous':
            clf = tree.DecisionTreeRegressor(
                min_samples_split = size, 
                min_samples_leaf = min_samples_leaf)
            clf.fit(X,y)
        else:
            clf = tree.DecisionTreeClassifier(
                min_samples_split = size, 
                min_samples_leaf = min_samples_leaf)
            clf = clf.fit(X, y)
        df['groupID'] = clf.apply(X)
        terminal_node_names = _extract_tree_terminal_names(clf, zVars)

        df['groupID'] = df['groupID'].map(
            { x[0]:i for (i,x) in enumerate( terminal_node_names ) })
        groupIDList = df['groupID'].values
        
        return Response({
            'groupIDList': groupIDList,
            'gNames': [u[1] for u in terminal_node_names] 
        })