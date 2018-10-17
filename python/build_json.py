import json
import sys

amino_acids = {
    "ALA": "A",
    "ARG": "R",
    "ASN": "N",
    "ASP": "D",
    "CYS": "C",
    "GLU": "E",
    "GLN": "Q",
    "GLY": "G",
    "HIS": "H",
    "ILE": "I",
    "LEU": "L",
    "LYS": "K",
    "MET": "M",
    "PHE": "F",
    "PRO": "P",
    "SER": "S",
    "THR": "T",
    "TRP": "W",
    "TYR": "Y",
    "VAL": "V",
}

acid_string = "ACDEFGHIKLMNPQRSTVWY"

def parse_metrics(file_name):
    out = {}
    clusters = [] #{size: #, clusters: #}
    with open(file_name, 'r') as file:
        for line in list(file):
            if line.startswith("num Points:"):
                out['points'] = int(line.split(':')[1])
            elif line.startswith("num Free Points:"):
                out['freePoints'] = int(line.split(':')[1])
            elif line.startswith("num Hinges:"):
                out['hinges'] = int(line.split(':')[1])
            elif line.startswith("num Bars:"):
                out['bars'] = int(line.split(':')[1])
            elif line.startswith("num Bodies:"):
                out['bodies'] = int(line.split(':')[1])
            elif line.startswith("num DOFs:"):
                out['dofs'] = int(line.split(':')[1])
            elif line.startswith("size of largest Clust:"):
                out['largestCluster'] = int(line.split(':')[1])
            elif line.startswith("avg cluster size:"):
                out['avgClusterSize'] = float(line.split(':')[1])
            elif line.startswith("size"):
                cluster = {"size": int(line.split()[1][:-1]),
                           "count": int(line.split()[2])
                           }
                clusters.append(cluster)
    return out, clusters

def calculate_distance(wt, mut):
    distance = 0
    for cluster in wt:
        distance += cluster['size'] * cluster['count']

    for cluster in mut:
        distance -= cluster['size'] * cluster['count']

    return distance

def main(pdbid):
    sequence = []

    with open(f"data/{pdbid}/{pdbid}.A.processed.pdb.knr", 'r') as file:
        for line in list(file):
            if line.startswith("SEQRES"):
                sequence += line.split()[4:]

    final_json = {}
    final_json['pdbid'] = pdbid

    final_json["basicStats"], final_json["clusterSizeDistribution"] = parse_metrics(f"data/{pdbid}/{pdbid}.A.processed.pdb_postPG_MetricsBBH.txt")
    mutations = []

    for i, amino in enumerate(sequence):
        row = {}
        row["index"] = i + 1
        row["aminoAcid"] = amino
        row["aminoAcidLetterCode"] = amino_acids[amino]
        mutants = {}
        for acid in acid_string:
            out, clusters = parse_metrics(f"data/{pdbid}/{pdbid}.AA{i + 1}{acid}.mut.out/{pdbid}.AA{i + 1}{acid}.processed.pdb_postPG_MetricsBBH.txt")
            item = {}
            item['rigidityDistance'] = calculate_distance(final_json["clusterSizeDistribution"], clusters)
            item["basicStats"] = out
            item["clusterSizeDistribution"] = clusters
            mutants[acid] = item
        row["mutants"] = mutants
        mutations.append(row)
    final_json["mutations"] = mutations

    with open(f"{pdbid}.json", 'w') as file:
        file.write(json.dumps(final_json, indent=4))




if __name__ == "__main__":
    main(sys.argv[1])
