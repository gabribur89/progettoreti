FROM rabbitmq:3.5-management

ADD  epgsql-3.1.0-rmq0.3.0-v3.5.x-git9f52f19.ez /usr/lib/rabbitmq/lib/rabbitmq_server-3.5.7/plugins/ 
ADD  pgsql_listen_exchange-0.3.0-v3.5.x.ez /usr/lib/rabbitmq/lib/rabbitmq_server-3.5.7/plugins/ 
ADD  enabled_plugins /etc/rabbitmq/enabled_plugins
#RUN  rabbitmq-plugins enable pgsql_listen_exchange