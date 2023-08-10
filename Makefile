#pip install localstack
#pip install awscli

#Makefile

init:
	docker run --name localstack -p 4566:4566 -e SERVICES=s3 -e DEFAULT_REGION=eu-west-2 localstack/localstack

start:
	docker start localstack

create-bucket:
	aws --endpoint-url=http://localhost:4566 s3 mb s3://tempus-broker-bucket

upload-file:
	aws --endpoint-url=http://localhost:4566 s3 cp function/resources/testing/check-your-answers-sample.json s3://tempus-broker-bucket
	aws --endpoint-url=http://localhost:4566 s3 ls tempus-broker-bucket

#Makes a secret with oracle connection data. Get this data from confluence and replace
create-secrets:
	aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name tempus-broker-oracle-data --secret-string [REPLACE_ME]

tariffSecretArn=$(shell aws --endpoint-url=http://localhost:4566 secretsmanager describe-secret --secret-id tempus-broker-oracle-data --query ARN)
create-parameters:
	aws --endpoint-url=http://localhost:4566 ssm put-parameter --name "tariff-secret-arn" --value $(tariffSecretArn) --type String
	aws --endpoint-url=http://localhost:4566 ssm put-parameter --name "kta-bucket-name" --value "tempus-broker-bucket" --type String



