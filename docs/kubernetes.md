# Production Infrastructure Overview

We use [Kubernetes](http://kubernetes.io) to handle deployment and scaling for all related containers.

If you are new to Kubernetes, it's worth reading their documentation to familiarize yourself with the various resource types we use in our application (particularly [Deployments](http://kubernetes.io/docs/user-guide/deployments/), but we also use [Services](http://kubernetes.io/docs/user-guide/services/), [ConfigMaps](http://kubernetes.io/docs/user-guide/configmap/), and [Secrets](http://kubernetes.io/docs/user-guide/secrets/)).

## Deployment & Containers

### mup-web (Deployment)
The `mup-web` deployment consists of three containers which serve our application together.

- `mup-web-app` - the node.js application
- `mup-web-asset` - the nginx file server for serving assets
- `ssl-proxy` - the proxy for serving all requests through https

#### mup-web-app (Container)
The node.js app serving the main web application.

The Docker image (`Dockerfile`) is responsible for setting up the application environment for production before packaging and starting the webserver.

It runs on port 8000 in the production cluster, and is not accessible externally.

#### mup-web-asset (Container)
The nginx webserver responsible for serving static assets (primarily the client-side bundled JS for each supported locale).

The Docker image (`Dockerfile.asset`) uses a custom nginx configuration (`nginx_asset.conf`) to serve the client-side builds.

It runs on port 8001 in the production cluster, and is not accessible externally.

#### ssl-proxy (Container)
The SSL/TLS termination proxy responsible for serving `mup-web` and `mup-web-asset` over a secure protocol.

It listens to traffic on ports 80 and 443, but will redirect all requests over `http` to be served via `https` (see `ssl-proxy-config` below).


## Additional Resources

### mup-web-svc (Service)
The `mup-web-svc` service is the external load balancer that functions as the entry point to our application.

It handles all incoming requests over ports 80/443 and passes them along to a `mup-web` deployment.

### mup-web (Secret)
The `mup-web` Secret is used to securely store and provide private information (such as oauth secrets or the photo scaler salt).

They are injected into the `mup-web-app` container as environment variables in the `mup-web` Deployment spec.

Instructions for deploying new secrets are located in the comments at the top of the file.

### ssl-proxy-config (Config Map)
The `ssl-proxy-config` is the nginx configuration for our application.

It is responsible for handling all traffic to the production domain name over ports 80 and 443. It forces all requests over http (port 80) to use https (port 443). It forwards all requests prefixed with the path `/static/*` to the `mup-web-asset` container on port 8001, and all other requests to the `mup-web` container running on port 8000.

It is mounted as a volume in the default location where nginx loads configuration files in the `ssl-proxy` container.

### ssl-proxy-certs (Secret)
The `ssl-proxy-certs` Secret stores the SSL/TLS certificate and key values for the production domain.

In the `mup-web` deployment spec, these values are mounted as a volume accessible to the `ssl-proxy` container and referenced in the nginx proxy's config (`ssl-proxy-config`).

Instructions for deploying a new version of this resource are located in the comments at the top of the file.

### webplatform (Namespace)
Every resource in this application exists in the `webplatform` namespace.


## Common Operations for Deploying, Monitoring & Debugging

### Setting up the Google Cloud SDK and Kubernetes CLI on your machine

#### Installing the `gcloud` cli and `kubectl`

To install the Google Cloud SDK, go to the [Quickstart for Mac OS X](https://cloud.google.com/sdk/docs/quickstart-mac-os-x) or go to the [SDK docs](https://cloud.google.com/sdk/docs/) and choose your platform.

After you have installed the SDK, install [Kubernetes](http://kubernetes.io/) using the `gcloud command`,
```
  $ gcloud components install kubectl
```

Once Kubernetes is installed, log into Google Cloud Platform with your Meetup email address,
```
  $ gcloud auth login <yourname@meetup.com>
```

Then, set some configuration for the project
```
  $ gcloud config set compute/zone us-east1-b
  $ gcloud config set project meetup-prod
  $ gcloud config set container/cluster meetup-prod
```

Get authenticating credentials for the Kubernetes cluster with the following command,
```
  $ gcloud container clusters get-credentials mup-prod --zone us-east1-b --project meetup-prod
```

This may not be necessary, but some engineers have had to authorize the cluster with your account,
```shell
  $ gcloud auth application-default login
```

To test if you are connected to the cluster you should see a list of namespaces from the command,
```
  $ kubectl get namespaces
```

#### Save a default namespace on your machine
Prefixing every request with `kubectl --namespace webplatform` will get old fast, so if you are only working within this context, you may want to save `webplatform` as your default namespace in your `kubectl` config.

1. Get your current context

	```
	$ export CONTEXT=$(kubectl config current-context)
	```

2. Update the default namespace

	```
	$ kubectl config set-context $CONTEXT --namespace=webplatform
	# Validate it
	$ kubectl config view | grep namespace:
	```

### Using `envtpl` to inject template variables to configuration files
Several of our Kubernetes resources expect several values that we can't or won't store in version control.

We use [envtpl](https://github.com/andreasjansson/envtpl) (installed with `pip install envtpl`) to render templates on the command line, populating template variables with shell environment variables.

	$ LOAD_BALANCER_IP=$(LOAD_BALANCER_IP) \
		envtpl < infrastructure/mup-web-svc.yaml | kubectl apply -f -

In the above example, we inject the `LOAD_BALANCER_IP` environment variable into the `mup-web-svc.yaml` template, and then pipe the results to the `kubectl apply` function.

### Observing resources via `kubectl get` & `kubectl describe`
When a new set of resources has been pushed to Kubernetes, you can begin monitoring them immediately.

Use the `get` command to return a high level list of resources, and use the `describe` command for a more detailed response. By default, these will return for all instances in the current namespace of the specified type.

	$ kubectl get services
	NAME          CLUSTER-IP      EXTERNAL-IP     PORT(S)          AGE
	mup-web-svc   10.96.240.142   104.196.98.37   80/TCP,443/TCP   1d

You can specify the resource as well - which is particularly useful when using `describe` to avoid

	$ kubectl describe services/mup-web-svc
	Name:			mup-web-svc
	Namespace:		webplatform
	Labels:			<none>
	Selector:		name=mup-web
	Type:			LoadBalancer
	IP:			10.96.240.142
	LoadBalancer Ingress:	104.196.98.37
	Port:			http	80/TCP
	NodePort:		http	32055/TCP
	Endpoints:		10.96.130.15:80
	Port:			https	443/TCP
	NodePort:		https	32714/TCP
	Endpoints:		10.96.130.15:443
	Session Affinity:	None


### Accessing the logs of a `mup-web` pod

You will need to specify both the pod and the container within the pod.

First, determine the name of the pod (don't forget, pods are relatively ephemeral, so these names will change with each deployment):

	$ kubectl get pods
	NAME                      READY     STATUS    RESTARTS   AGE
	mup-web-940312899-0c09l   3/3       Running   0          18m

Then, specify the container in said pod. If you don't know the name, `kubectl` will inform you of the available containers within said pod:

	$ kubectl logs mup-web-940312899-0c09l
	Error from server: a container name must be specified for pod mup-web-940312899-0c09l, choose one of: [mup-web-app mup-web-asset ssl-proxy]

Finally, let's view the logs of the `mup-web-app` container:

	$ kubectl logs mup-web-940312899-0c09l mup-web-app
	> mup-web@0.1.0 start:prod /home/mup/mup-web
	> node scripts/runServer.js

	Supported languages:
	en-US
	en-AU
	de-DE
	fr-FR
	ja-JP
	it-IT
	pt-BR
	es-ES
	es
	2016-12-14 22:06:28.203, [log,start] data: 4 plugins registered, assigning routes...
	2016-12-14 22:06:28.217, [log,start] data: 5 routes assigned, starting server...
	2016-12-14 22:06:28.226, [log,start] data: Dev server is listening at http://0.0.0.0:8000


### Debugging a specific container in a `mup-web` pod

If you need to SSH into a pod, pass in the name of the pod, container, and command to `kubectl exec`.

	$ kubectl get pods
	NAME                      READY     STATUS    RESTARTS   AGE
	mup-web-940312899-0c09l   3/3       Running   0          29m

	$ kubectl exec -ti mup-web-940312899-0c09l -c mup-web-app -- bash
	root@mup-web-940312899-0c09l:/#

#### Installing curl

Since Docker images tend to be lean as possible, the container you access may not have some packages or utilities installed you may expect to use while debugging.

	root@mup-web-940312899-0c09l:/# curl meetup.computer
	bash: curl: command not found

	root@mup-web-940312899-0c09l:/# apt-get update && apt-get install curl
	Get:1 http://security.debian.org jessie/updates InRelease [63.1 kB]

	[...updating packages & installing curl]

	Processing triggers for libc-bin (2.19-18+deb8u6) ...
	root@mup-web-940312899-0c09l:/# curl meetup.computer

	[...html response]

Because of their ephemeral nature, you'll need to repeat this process on new pods when this pod no longer exists. This is fine, because it makes cleaning up after yourself easy - just delete the pod. Kubernetes will spawn a new pod based on the original deployment spec.

	$ kubectl delete pods/mup-web-940312899-0c09l

#### Diagnosing which process is using a specific port

One of the benefits of this deployment strategy is that the various containers can talk to each other over `localhost/127.0.0.1`. If you're struggling to access a container, use `lsof` to validate whether or not that container is listening on the expected port.

	$ kubectl exec -ti mup-web-940312899-0c09l -c mup-web-asset -- bash

	root@mup-web-940312899-0c09l:/# lsof
	bash: lsof: command not found

	root@mup-web-940312899-0c09l:/# apt-get update && apt-get install lsof
	Reading package lists... Done

	[...updating packages & installing lsof]

	Setting up lsof (4.86+dfsg-1) ...

	root@mup-web-940312899-0c09l:/# lsof -i :8001
	COMMAND PID USER   FD   TYPE  DEVICE SIZE/OFF NODE NAME
	nginx     1 root    6u  IPv4 9688863      0t0  TCP *:8001 (LISTEN)
